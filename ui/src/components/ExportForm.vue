<template>
  <q-card flat>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Exportar Archivo {{schema.title}}</div>
        <div class="text-subtitle2">Seleccione formato</div>
      </q-card-section>
      <q-separator />
      <div class="row">
        <q-item tag="label" v-ripple v-for="format in formats" v-bind:key="format.format" class="col-12">
          <q-item-section avatar>
            <q-radio v-model="fileFormat" :val="format.format" />
          </q-item-section>
          <q-item-section>
            <q-item-label><q-icon :name="format.icon" color="secondary" /> {{format.name}} </q-item-label>
            <q-item-label caption>{{format.caption}}</q-item-label>
          </q-item-section>
          <q-item-section v-if="format.delimiter">
            <q-item-label caption> <q-input v-model="delimiter" label="Delimitador" /></q-item-label>
          </q-item-section>
        </q-item>
      </div>

      <q-separator />
      <q-card-section>
          <q-input v-model="fileName" label="Nombre del Archivo" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn icon="cloud_download" @click="downloadFile()" label="Descargar Archivo"></q-btn>
      </q-card-actions>
  </q-card>
</template>

<script>
import api from '../services/histrixApi.js'

export default {
  name: 'ExportForm',
  props: {
    path: null,
    query: null,
    schema: {},
  },
  components: {
  },
  watch: {
    fileFormat() {
      this.fileName = `${this.schema.title}.${this.fileFormat}`;
    },
  },
  mounted() {
    this.fileName = `${this.schema.title}.${this.fileFormat}`;
  },
  data() {
    return {
      formats: [
        {
          format: 'xls',
          name: 'Excel',
          caption: 'Hoja de Cálculo',
          icon: 'fas fa-file-excel',
        },
        {
          format: 'pdf',
          name: 'PDF',
          caption: 'Documento PDF',
          icon: 'fas fa-file-pdf',
        },
        {
          format: 'csv',
          name: 'CSV',
          caption: 'Texto delimitado por comas',
          delimiter: ',',
          icon: 'fas fa-file-csv',
        },
        {
          format: 'xml',
          name: 'XML',
          caption: 'Archivo XML de exportación',
          icon: 'description',
        },
      ],
      fileName: '',
      fileFormat: 'xls',
      delimiter: ',',
    };
  },
  computed: {
  },
  methods: {
    downloadFile() {
      api.downloadAppData(this.path, this.query, this.fileFormat, this.fileName)
    },
  },
};
</script>
