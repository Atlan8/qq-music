(function(window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        init: function($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        progressClick: function(callBack) {
            let $this = this; // 保存的是外面的（progress）this

            this.$progressBar.click(function(event) {
                let normalLeft = $(this).offset().left;
                let eventLeft = event.pageX;

                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft);

                // 计算进度条比例
                let value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);
            })
        },
        progressMove: function(callBack) {
            let $this = this;
            let normalLeft = this.$progressBar.offset().left;
            let barWidth = this.$progressBar.width();
            let eventLeft;

            this.$progressBar.mousedown(function() {
                $this.isMove = true; // 设为true，说明正在使用拖拽设置进度条
                $(document).mousemove(function(event) {
                    eventLeft = event.pageX;
                    let offset = eventLeft - normalLeft;
                    if (offset >= 0 && offset <= barWidth) {
                        $this.$progressLine.css("width", offset);
                        $this.$progressDot.css("left", offset);
                    }
                });
            });
            $(document).mouseup(function() {
                // 移除事件
                $(document).off("mousemove");
                $this.isMove = false; // 设为false，说明结束拖拽设置进度条，应改为自动设置

                let value = (eventLeft - normalLeft) / barWidth;
                callBack(value);
            });
        },
        setProgress: function(value) {
            if(this.isMove) return; // 解决进度条设置冲突问题，true则停止自动设置进度条
            if (value < 0 || value > 100) return;
            this.$progressLine.css({
                width: value+"%"
            });
            this.$progressDot.css({
                left: value+"%"
            })
        }
    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress
})(window);