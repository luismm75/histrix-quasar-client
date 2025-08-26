<template>
  <div>
    <q-card flat bordered>
      <q-toolbar class="bg-orange text-white shadow-2">
        <q-toolbar-title
          ><q-avatar text-color="white" icon="folder" round />{{path}}</q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <!--
          <q-item v-for="(file, index) in files" v-bind:key="index">


              <q-item-section>
                  {{file.name}}
              </q-item-section>
              <q-item-section>
                  {{file.size}}
              </q-item-section>
              <q-item-section>
                  {{file.time}}
              </q-item-section>
          </q-item>
          -->

          

      <VueFileAgent 
      ref="fileAgent"
      :uploadUrl="uploadUrl" 
      :thumbnailSize="120"
      @beforedelete="onBeforeDelete($event)"
      @delete="onDelete($event)"
      :deletable="true"
      theme="list"
      :uploadHeaders="uploadHeaders"
      helpText="Elija o arrastre aquí sus archivos"
      v-model="files">

<!--      
    <template v-slot:file-preview-before="{ fileRecord, index }">
      aaa<span class="file-preview-button">Button</span>
    </template>
    -->  
      </VueFileAgent>
          
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import useApi from '../../services/histrixApi.js';

export default {
  name: 'HistrixFileManager',
  setup() {
    const { getFiles, apiUrl, deleteFile } = useApi();
    return { getFiles, apiUrl, deleteFile };
  },
  props: ['path'],
  components: {},
  data() {
    return {
      files: [],
      uploadHeaders: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      uploadUrl: `${this.apiUrl()}/files${this.path}`
    };
  },
  computed: {},
  methods: {
    getFiles() {
      let files = [];
      this.getFiles(this.path).then((success) => {
        files = success.data.data;
        this.files = files
          .map((item) => {
            const file = item.node;
            file.name = file.basename;
            return file;
          })
          .filter((item) => item.type !== 'dir');
      });
    },
    onBeforeDelete(fileRecord) {
      if (confirm('¿Esta seguro que desea borrar el archivo ?')) {
        this.$refs.fileAgent.deleteFileRecord(fileRecord);
      }
    },
    onDelete(fileRecord) {
      const url = this.uploadUrl + fileRecord.name();

      this.$refs.fileAgent.deleteUpload(url, this.uploadHeaders, fileRecord);
      this.deleteFile(this.path + fileRecord.name()).then((_success) => {
        this.getFiles();
      });
    }
  },
  mounted() {
    this.getFiles();
  }
};
</script>
<style>
  .my-file-agent .file-preview-wrapper .file-preview {
    width: calc(100% - 50px); /* 50px: width of the button */
  }
  .my-file-agent .file-preview-button {
    position: absolute;
    z-index: 11;
    width: 50px;
    height: 100%;
    right: 0;
    background: yellow;
    border: 2px solid red;
  }
</style>