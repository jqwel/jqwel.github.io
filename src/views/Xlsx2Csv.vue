<template>
  <div>
    <h2>Excel 转 CSV</h2>
    <div class="dropzone" @click="triggerFile" @drop.prevent="onDrop" @dragover.prevent>
      拖入或点击选择 Excel 文件
    </div>
    <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none;" @change="onFileChange" />
    <button v-if="csvContent" @click="downloadCsv" class="btn btn-primary">下载 CSV</button>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  name: "Xlsx2Csv",
  data() {
    return {
      csvContent: ""
    };
  },
  methods: {
    triggerFile() {
      this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file && /\.(xlsx|xls)$/.test(file.name)) {
        this.readFile(file);
      } else {
        alert("请上传 Excel 文件");
      }
    },
    onDrop(e) {
      const file = e.dataTransfer.files[0];
      if (file && /\.(xlsx|xls)$/.test(file.name)) {
        this.readFile(file);
      } else {
        alert("请拖入有效的 Excel 文件");
      }
    },
    readFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        this.csvContent = XLSX.utils.sheet_to_csv(sheet, { FS: ",", strip: true });
        alert("转换成功");
      };
      reader.readAsArrayBuffer(file);
    },
    downloadCsv() {
      const blob = new Blob(["\uFEFF" + this.csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style scoped>
.dropzone {
  width: 100%;
  padding: 50px;
  border: 2px dashed #aaa;
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  cursor: pointer;
}
</style>
