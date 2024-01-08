<template>
  <q-card flat bordered class="">
    <q-card-section v-if="loading">
      <q-skeleton type="QToolbar" />
    </q-card-section>
    <q-card-section class="row" v-if="!loading">
      <span class="col-2">{{ schema.title }}</span>
      <q-space />
      <HistrixFilters
        v-if="schema.filters[0]"
        dense
        :schema="schema"
        v-on:filter-data="getData(xmlUrl($event))"
      />
    </q-card-section>
    <q-separator inset></q-separator>
    <q-card-section v-if="loading">
      <q-skeleton :style="styles" square />
    </q-card-section>
    <q-card-section v-if="showCharts">
      <div
        class="q-pa-md"
        v-bind:key="chart.id"
        v-for="chart in schema.charts"
        :style="styles"
      >
        <IEcharts
          ref="chart"
          theme="light"
          :resizable="true"
          :style="styles"
          :option="chartOptions[chart.id]"
          v-if="!loading"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import histrixApi from '../services/histrixApi.js';

export default {
  name: 'HistrixChart',
  props: {
    path: '',
    query: '',
    styles: '',
    schema: {},
    resources: {},
  },
  components: {
    HistrixFilters: () => import('./HistrixFilters.vue'),
    IEcharts: () => import('vue-echarts-v3/src/full.js'),
  },
  mounted() {
    const url = this.xmlUrl();

    this.getData(url);
  },
  watch: {
    path(newVal, oldVal) {
      const url = this.xmlUrl();
      this.getData(url);
    },
    chartTypes(newVal, oldVal) {
      console.log(newVal.key);
      /*
       this.chartOptions.map(function(options){
        newSeries = options.series.map(function(serie) {
          serie.type = newVal
          return serie
        })
        console.log(newSeries)
        console.log(options.series)
        options.series  = newSeries
      }, this)
//      console.log(this.chartOptions)
*/
    },
  },
  computed: {},
  methods: {
    /*
    SaveImage(type) {
        const linkSource = this.$refs[type].getDataURL();
        const downloadLink = document.createElement('a');
        document.body.appendChild(downloadLink);
        downloadLink.href = linkSource;
        downloadLink.target = '_self';
        downloadLink.download = type + '.png';
        downloadLink.click();
    },
    */
    xmlUrl(query) {
      return `${this.schema.api}/app/${this.path}?${query || ''}`;
    },
    setChartOptions(data) {
      var series = [];
      let types = this.types;
      this.schema.charts.map((chart) => {
        let options = this.defaultOptions;

        options.title.text = chart.titulo;
        options.title.subtext = chart.subtitulo;

        let label = chart.etiquetas;

        if (chart.tipo == 'P') {
          options.xAxis = null;
          options.yAxis = null;
          series = this.getDataIfIsPie(chart, data);
        } else {
          options.dataset.dimensions = Object.keys(chart.series);
          series = Object.keys(chart.series).map((serie) => {
            let xaxis = [];
            let newdata = [];
            data.map((item) => {
              newdata.push(item[serie]);
              xaxis.push(item[label]);
            });
            options.xAxis.data = xaxis;
            return {
              name: this.schema.fields[serie].title,
              type: types[chart.tipo],
              stack: chart.tipo == 'SC' ? 'A' : null,
              data: newdata,
            };
          }, this);
        }
        options.series = series;

        this.chartOptions[chart.id] = options;
      }, this);

      this.showCharts = true;
    },
    getDataIfIsPie(chart, data) {
      const keysSerie = Object.keys(chart.series);
      let series = [];
      if (keysSerie.length >= 1) {
        let tempArray = [];
        for (let key of keysSerie) {
          const newdata = data.map((item) => ({
            value: item[key],
            name: this.schema.fields[key].title,
          }));
          tempArray.push(newdata);
        }
        series = [
          {
            name: chart.datos,
            type: this.types[chart.tipo],
            data: tempArray.flat(),
          },
        ];
      } else {
        let newdata = data.map((item) => ({
          value: item[chart.datos],
          name: item[chart.etiquetas],
        }));
        series = [
          {
            name: chart.datos,
            type: this.types[chart.tipo],
            // radius: ['40%', '70%'],z|
            data: newdata,
          },
        ];
      }
      return series;
    },
    getData(url) {
      histrixApi
        .getData(url)
        .then((response) => {
          this.setChartOptions(response.data.data);
          this.loading = false;
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    },
  },
  data() {
    return {
      showCharts: false,
      message: null,
      dialog: false,
      types: { L: 'line', P: 'pie', C: 'bar', SC: 'bar' },
      loading: true,
      mode: 'list',
      editedItem: [],
      dataContainer: null,
      data: [],
      chartOptions: [],
      chartTypes: [],
      defaultOptions: {
        title: { text: '' },
        grid: {
          bottom: '20%',
          left: '5%',
          top: '10%',
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
        },

        tooltip: {
          show: true,
        },
        // Global palette:
        // color: ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
        dataset: {
          dimensions: [],
          source: [],
        },
        xAxis: {},
        yAxis: {},
        series: [],
      },
    };
  },
};
</script>
