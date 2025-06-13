<template>
  <div>
    <h1 class="mb-3">JSON 格式化</h1>
    <textarea ref="jsonArea" v-model="jsonText" rows="12" class="form-control"></textarea>
    <div class="d-flex gap-2 mt-2">
      <button @click="formatJson" class="btn btn-primary">Format</button>
      <button @click="unformatJson" class="btn btn-info">Unformat</button>
      <button ref="copyBtn" class="btn btn-success">Copy</button>
<!--      <button ref="copyBtn" class="btn btn-success" data-clipboard-target="#jsonarea">Copy</button>-->
    </div>
  </div>
</template>

<script>
import ClipboardJS from "clipboard";

export default {
  name: "JsonTool",
  data() {
    return {
      jsonText: '{"ABC":123,张三:"a~b~c",a:`10`,\'b\':20,"c":"30","d":true,`e`:10.20,f:60.0, g:10+"33"}'
    };
  },
  // mounted() {
  //   new ClipboardJS(this.$refs.copyBtn);
  // },
  mounted() {
    // 手动指定 text 提供者函数
    this.clipboard = new ClipboardJS(this.$refs.copyBtn, {
      text: () => this.$refs.jsonArea.value
    });

    this.clipboard.on("success", () => {
      this.$refs.jsonArea.select();
    });
    // this.clipboard.on("success", () => alert("复制成功！"));
    // this.clipboard.on("error", (e) => alert("复制失败：" + e.message));
  },
  methods: {
    formatJson() {
      try {
        let fixed = this.jsonText
            // 去掉多余的换行和空格（可选）
            .trim()
            // 把 `key` 或 'key' 统一转成 "key"
            .replace(/([{,]\s*)([`'])([^"`']+?)\2(\s*:)/g, '$1"$3"$4')
            // 把没加引号的 key 也补上
            .replace(/([{,]\s*)([a-zA-Z0-9_\u4e00-\u9fa5]+)(\s*:)/g, '$1"$2"$3')
            // 把 value 里单引号包的字符串转成双引号（避免对数字、true/false/null 误操作）
            .replace(/:\s*'([^']*)'/g, ': "$1"')
            .replace(/:\s*`([^`]*)`/g, ': "$1"');
        const obj = JSON.parse(fixed);
        this.jsonText = JSON.stringify(obj, null, 2);
        this.$refs.jsonArea.select();
      } catch (err) {
        // alert("无效 JSON: " + err.message);
      }
    },
    unformatJson() {
      try {
        this.formatJson();
        const obj = JSON.parse(this.jsonText);
        this.jsonText = JSON.stringify(obj);
        this.$refs.jsonArea.select();
      } catch (err) {
        // alert("无效 JSON: " + err.message);
      }
    }
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
}
</style>
