$(function() {
    $(".content_list").mCustomScrollbar();

    let $audio = $("audio");
    let player = new Player($audio);
    let progress;
    let voiceProgress;
    let lyric;

    // 初始化进度条
    initProgress();
    function initProgress() {
        let $progressBar = $(".music_progress_bar");
        let $progressLine = $(".music_progress_line");
        let $progressDot = $(".music_progress_dot");
        progress = new Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function(value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function(value) {
            player.musicSeekTo(value);
        });

        let $voiceBar = $(".music_voice_bar");
        let $voiceLine = $(".music_voice_line");
        let $voiceDot = $(".music_voice_dot");
        voiceProgress = new Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function(value) {
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function(value) {
            player.musicVoiceSeekTo(value);
        });
    }

    // 加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function(data) {
                player.musicList = data;
                // 3.1 遍历获取到的数据，创建每一条音乐
                let $musiclist = $(".content_list ul");
                $.each(data, function(index, music) {
                    let $item = createMusicItem(index, music);
                    $musiclist.append($item);
                });
                initMusicInfo(data[0]);
                // initMusicLyric(data[0]);
            },
            error: function(e) {
                console.log(e);
            }
        });
    }
    function createMusicItem(index, music) {
        let $item = $("<li class=\"list_music\">\n" +
            "                        <div class=\"list_check\"><i></i></div>\n" +
            "                        <div class=\"list_number\">"+(index+1)+"</div>\n" +
            "                        <div class=\"list_name\">\n" +
            "                            <div class='music_name'>"+music.name+"</div>\n" +
            "                            <div class=\"list_menu\">\n" +
            "                                <a class='list_menu_play' href='javascript:;' title=\"播放\"></a>\n" +
            "                                <a href='javascript:;' title=\"添加\"></a>\n" +
            "                                <a href='javascript:;' title=\"下载\"></a>\n" +
            "                                <a href='javascript:;' title=\"分享\"></a>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"list_singer\">"+music.singer+"</div>\n" +
            "                        <div class=\"list_time\">\n" +
            "                            <span>"+music.time+"</span>\n" +
            "                            <a href='javascript:;' title=\"删除\" class='list_menu_del'></a>\n" +
            "                        </div>\n" +
            "                    </li>");

        $item.get(0).index = index;
        $item.get(0).music = music;

        return $item;
    }
    function initMusicInfo(music) {
        let $musicImage = $(".song_info_pic img");
        let $musicName = $(".song_info_name a");
        let $musicSinger = $(".song_info_singer a");
        let $musicAlbum = $(".song_info_album a");
        let $musicProgressName = $(".music_progress_name");
        let $musicProgressTime = $(".music_progress_time");
        let $musicBg = $(".mask_bg");

        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAlbum.text(music.album);
        $musicProgressName.text(music.name + " - " + music.singer);
        $musicProgressTime.text("00:00 / "+ music.time);
        $musicBg.css("background", "url('"+music.cover+"')");
    }
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        let $lyricContainer = $(".song_lyric");
        // 清空上一首歌的歌词
        $lyricContainer.html("");
        lyric.loadLyric(function() {
            // 创建歌词列表
            $.each(lyric.lyrics, function(index, elem) {
                let $item = $("<li>"+elem+"</li>");
                $lyricContainer.append($item);
            });
        });
    }

    // 初始化事件监听
    initEvents();
    function initEvents() {
        // 1. 监听歌曲的移入移出事件，需要用到事件委托
        $(".content_list").delegate(".list_music", "mouseenter", function() {
            // 显示子菜单，隐藏时长
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time span").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeIn(100);
        });
        $(".content_list").delegate(".list_music", "mouseleave", function() {
            // 隐藏子菜单，显示时长
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time span").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeOut(100);
        });

        // 2. 监听复选框的点击
        $(".content_list").delegate(".list_check", "click", function() {
            // 没有就添加，有就去除
            $(this).toggleClass("list_checked");
        });

        // 3. 添加子菜单播放按钮的监听
        let $musicPlay = $(".music_play");
        $(".content_list").delegate(".list_menu_play", "click", function() {
            let $item = $(this).parents(".list_music");

            // 3.1.1 切换类名
            $(this).toggleClass("list_menu_pause");
            $item.siblings().find(".list_menu_play").removeClass("list_menu_pause");

            // 3.1.2 复原其他的播放图标
            $item.siblings().find(".list_menu i").removeClass("icon-suspend").addClass("icon-play");

            // 3.1.3 同步底部播放按钮 通过判断选中的元素是否包含pause来操作
            if ($(this).attr("class").indexOf("list_menu_pause") !== -1) {
                // 当前子菜单是播放状态
                $musicPlay.addClass("music_pause");

                $item.find("div").css("color", "#fff");
                $item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
            } else {
                // 不是播放状态
                $musicPlay.removeClass("music_pause");

                $item.find("div").css("color", "rgba(255,255,255,0.5)");
            }

            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");

            // 3.1.5 播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);

            initMusicInfo($item.get(0).music);
            initMusicLyric($item.get(0).music);

            // 监听播放进度
            player.musicTimeUpdate(function(currentTime, duration, timeStr) {
                $(".music_progress_time").text(timeStr);

                let value = currentTime / duration * 100;
                progress.setProgress(value);

                // 实现歌词滚动
                let index_lrc = lyric.currentIndex(currentTime);
                let $item = $(".song_lyric li").eq(index_lrc);
                $item.addClass("cur").removeClass("bef");
                $item.siblings().removeClass("cur").addClass("bef");


                if (index_lrc <= 0) return;

                $(".song_lyric").css({
                    marginTop: (-index_lrc) *30
                })
            });
        });

        // 4. 底部控制区域的点击
        $musicPlay.click(function() {
            if (player.currentIndex === -1) {
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            } else {
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });
        $(".music_pre").click(function() {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });
        $(".music_next").click(function() {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        $(".content_list").delegate(".list_menu_del", "click", function() {
            let $item = $(this).parents(".list_music");

            // 判断当前删除的音乐是否正在播放，若是则切换到下一首
            if ($item.get(0).index === player.currentIndex) {
                $(".music_next").trigger("click");
            }
            $item.remove();
            player.changeMusic($item.get(0).index);

            // 重新排序
            $(".list_music").each(function(index, elem) {
                elem.index = index;
                $(elem).find(".list_number").text(index + 1);
            });
        });

        $(".music_voice_icon").click(function() {
            $(this).toggleClass("music_voice_icon2");

            if ($(this).attr("class").indexOf("music_voice_icon2")!== -1) {
                // 变为没有声音
                player.musicVoiceSeekTo(0);
            } else {
                player.musicVoiceSeekTo(0.5);
            }
        });
    }


});