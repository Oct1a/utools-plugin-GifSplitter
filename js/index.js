new Vue({
    el: '#app',
    data: function() {
        return {
            imgae_List: [],
            dialogVisible: false,
            showImage: "", //弹窗显示图片地址
            loading: false,
            fileName: "" //文件名用于生成zip文件用
        }
    },
    created() {
        // utools.onPluginEnter(({ code, type, payload }) => { //拖动后直接解析
        // });
    },
    methods: {
        copyImage() {
            window.utools.copyImage(this.showImage, false);
            window.utools.showNotification('复制成功！');
        },
        downloadImage() {
            let url = this.showImage;
            let tag_temp = document.createElement('a');
            let event = new MouseEvent('click')
            tag_temp.download = 'Gif_Partition';
            tag_temp.href = url;
            tag_temp.dispatchEvent(event);
        },
        EnlargeImages(item) { //选中图片后弹窗
            this.dialogVisible = true
            this.showImage = item
        },
        imgSaveToUrl(event) { // 选取图片后自动回调，里面可以获取到文件
            let fileType = event.name.substring(event.name.lastIndexOf(".") + 1).toLowerCase();
            let fileName = event.name.substring(0, event.name.lastIndexOf("."));
            console.log(fileName)
            if (fileType !== "gif") {
                window.utools.showNotification("请上传gif图片格式")
            } else {
                this.imgae_List = [];
                this.fileName = fileName;
                this.load_gif(event.raw)
            }
        },
        load_gif(gif_source) { //gif分割
            let gifImg = document.createElement("img");
            // gif库需要img标签配置下面两个属性
            gifImg.setAttribute('rel:animated_src', URL.createObjectURL(gif_source))
            gifImg.setAttribute('rel:auto_play', '0')
                // 新建gif实例
            let rub = new SuperGif({
                gif: gifImg
            });
            rub.load(() => {
                for (let i = 1; i <= rub.get_length(); i++) {
                    // 遍历gif实例的每一帧
                    rub.move_to(i);
                    var imgImage = new Image();
                    //canvas生成base64图片数据
                    imgImage.src = rub.get_canvas().toDataURL('image/png', 1);
                    this.imgae_List.push(imgImage.src)
                }
                this.loading = false;
            })

        },
        batchDownload() { //打包下载
            let zip = new JSZip(); //创建实例，zip是对象实例
            //此处为下载压缩包操作
            this.imgae_List.forEach((element, index) => {
                let dataURL = this.imgae_List[index];
                let img_arr = dataURL.split(',');
                zip.file(index.toString() + '.jpg', img_arr[1], {
                    base64: true
                }); //根据base64数据在压缩包中生成jpg数据
                let arr = Object.keys(zip.files)
                if (arr.length == this.imgae_List.length) { //当所有图片都已经生成打包并保存zip
                    zip.generateAsync({
                            type: "blob"
                        })
                        .then((content) => {
                            saveAs(content, this.fileName + ".zip");
                        });
                }
            });
        }
    }
})