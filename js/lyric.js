(function(window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function(path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        loadLyric: function(callBack) {
            let $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function(data) {
                    // 一个方法只做一件事情，面向对象思想
                    $this.parseLyric(data);
                    callBack(); // 回调函数，说明歌词已经加载好了
                },
                error: function(e) {
                    console.log(e);
                }
            });
        },
        parseLyric: function(data) {
            let $this = this;

            // 一定要清空上一首歌的歌词和时间
            $this.times = [];
            $this.lyrics = [];

            let array = data.split("\n");
            // console.log(array);
            // 匹配时间
            let timeReg = /\[(\d*:\d*\.\d*)\]/;
            $.each(array, function(index, elem) {
                let lyr = elem.split("]")[1];
                // 排除空字符串
                if (lyr.length === 1) return;
                $this.lyrics.push(lyr);

                let res = timeReg.exec(elem);
                if (res == null) return true;
                let timeStr = res[1]; // 00:00.92
                let res2 = timeStr.split(":");
                let min = parseInt(res2[0]) * 60;
                let sec = parseFloat(res2[1]);
                let time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);
            });

        },
        currentIndex: function(currentTime) {
            // 如0.93 >= 0.92，则times里面的0.92被删除
            if (currentTime >= this.times[0]) {
                this.index++;
                this.times.shift(); // 删除数组最前面的一个元素
            }
            return this.index;
        }
    };
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);