<template>
  <div>
    <!-- Excel 转 CSV -->
    <h2>Excel 转 CSV</h2>
    <div
        class="dropzone"
        @click="triggerExcelFile"
        @drop.prevent="onExcelDrop"
        @dragover.prevent
    >
      拖入或点击选择 Excel 文件
    </div>
    <input
        ref="excelInput"
        type="file"
        accept=".xlsx,.xls"
        style="display: none;"
        @change="onExcelChange"
    />
    <button
        v-if="csvContent"
        @click="downloadCsv"
        class="btn btn-primary mt-3"
    >
      下载 CSV
    </button>

    <hr class="my-4" />

    <!-- CSV 编码检测 -->
    <h3>CSV 编码检测</h3>
    <div
        class="dropzone"
        @click="triggerCsvFile"
        @drop.prevent="onCsvDrop"
        @dragover.prevent
    >
      拖入或点击选择 CSV 文件
    </div>
    <input
        ref="csvInput"
        type="file"
        accept=".csv"
        style="display: none;"
        @change="onCsvChange"
    />

    <div v-if="csvBomInfo" class="alert mt-3" :class="bomClass">
      {{ csvBomInfo }}
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";

export default {
  name: "Xlsx2Csv",
  data() {
    return {
      csvContent: "",
      csvBomInfo: "",
    };
  },
  computed: {
    bomClass() {
      if (this.csvBomInfo.includes("✅")) return "alert-success";
      if (this.csvBomInfo.includes("⚠️")) return "alert-warning";
      return "alert-secondary";
    },
  },
  methods: {
    /** Excel 转 CSV 部分 **/
    triggerExcelFile() {
      this.$refs.excelInput.click();
    },
    onExcelChange(e) {
      const file = e.target.files[0];
      if (file && /\.(xlsx|xls)$/i.test(file.name)) {
        this.readExcel(file);
      } else {
        alert("请上传有效的 Excel 文件");
      }
    },
    onExcelDrop(e) {
      const file = e.dataTransfer.files[0];
      if (file && /\.(xlsx|xls)$/i.test(file.name)) {
        this.readExcel(file);
      } else {
        alert("请拖入有效的 Excel 文件");
      }
    },
    readExcel(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        this.csvContent = XLSX.utils.sheet_to_csv(sheet, {
          FS: ",",
          strip: true,
        });
        alert("Excel 转换成功！");
      };
      reader.readAsArrayBuffer(file);
    },
    downloadCsv() {
      const blob = new Blob(["\uFEFF" + this.csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.csv";
      a.click();
      URL.revokeObjectURL(url);
    },

    /** CSV 编码检测部分 **/
    triggerCsvFile() {
      this.$refs.csvInput.click();
    },
    onCsvChange(e) {
      const file = e.target.files[0];
      if (file && /\.csv$/i.test(file.name)) {
        this.checkCsvBom(file);
      } else {
        alert("请上传 CSV 文件");
      }
    },
    onCsvDrop(e) {
      const file = e.dataTransfer.files[0];
      if (file && /\.csv$/i.test(file.name)) {
        this.checkCsvBom(file);
      } else {
        alert("请拖入有效的 CSV 文件");
      }
    },
    checkCsvBom(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = new Uint8Array(e.target.result);
        if (
            buffer.length >= 3 &&
            buffer[0] === 0xef &&
            buffer[1] === 0xbb &&
            buffer[2] === 0xbf
        ) {
          this.csvBomInfo = `✅ 文件：${file.name} 包含 UTF-8 BOM。`;
        } else {
          this.csvBomInfo = `⚠️ 文件：${file.name} 缺少 UTF-8 BOM，可能导致中文乱码。建议使用上方的 XLSX 转换工具重新导出。`;
        }
      };
      reader.readAsArrayBuffer(file.slice(0, 3));
    },
  },
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
  border-radius: 10px;
  transition: background-color 0.2s;
}
.dropzone:hover {
  background-color: #f8f9fa;
}
.alert {
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
}
.alert-success {
  background: #d4edda;
  color: #155724;
}
.alert-warning {
  background: #fff3cd;
  color: #856404;
}
.alert-secondary {
  background: #e2e3e5;
  color: #383d41;
}
</style>
