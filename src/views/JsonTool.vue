<template>
  <div>
    <h1 class="mb-3">JSON 格式化</h1>
    <textarea ref="jsonArea" v-model="jsonText" rows="12" class="form-control"></textarea>
    <div class="d-flex flex-wrap gap-2 mt-2">
      <button @click="formatJson" class="btn btn-primary">Format</button>
      <button @click="unformatJson" class="btn btn-info">Unformat</button>
      <button @click="beautifyJson" class="btn btn-primary">Beautify</button>
      <button ref="copyBtn" class="btn btn-success">Copy</button>
      <button @click="initData" class="btn btn-primary">Init</button>
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
      jsonText: '{}',
      beautified: false,
      beautified_raw: '',
    };
  },
  // mounted() {
  //   new ClipboardJS(this.$refs.copyBtn);
  // },
  mounted() {
    this.initData();
    // 手动指定 text 提供者函数
    this.clipboard = new ClipboardJS(this.$refs.copyBtn, {
      text: () => this.$refs.jsonArea.value
    });

    this.clipboard.on("success", () => {
      this.$refs.jsonArea.select();
    });
  },
  methods: {
    initData() {
      this.jsonText = '{\n  "ABC":123, 张三:"a~b~c",  \n  a:`10`,\'b\':20, "c":"30","d":true,  \n  e:`10.\\n20`,f:60.0, g:10+"33"  \n}';
      this.beautified = false;
      this.beautified_raw = '';
    },
    formatJson() {
      if (this.beautified) {
        this.beautified = false
        this.jsonText = this.beautified_raw
      }
      try {
        const obj = eval('(' + this.jsonText + ')');
        this.jsonText = JSON.stringify(obj, null, 2);
        // this.$refs.jsonArea.select();
      } catch (err) {
        console.error(err.message)
        return err
      }
    },
    unformatJson() {
      try {
        const err = this.formatJson();
        if (err) {
          throw err
        }
        const obj = JSON.parse(this.jsonText);
        this.jsonText = JSON.stringify(obj);
        // this.$refs.jsonArea.select();
      } catch (err) {
        console.error(err.message)
        return err
      }
    },
    parseWithNewlines(str) {
      return str.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
    },
    beautifyJson() {
      try {
        if (this.beautified) return;
        const err = this.formatJson()
        if (err) {
          throw err
        }
        this.beautified = true
        this.beautified_raw = this.jsonText
        const raw = this.jsonText;
        const processed = this.parseWithNewlines(raw);
        this.jsonText = processed;
        // this.$refs.jsonArea.select();
      } catch (err) {
        console.error(err.message)
        return err
      }
    },
  }
};
</script>

<style scoped>
textarea {
  width: 100%;
  height: calc(100vh - 360px); /* 减去头部和按钮等大约120px */
}
</style>
