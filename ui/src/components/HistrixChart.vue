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
        @filter-data="getData(xmlUrl($event))"
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
        <v-chart
          ref="chart"
          :style="styles"
          :option="chartOptions[chart.id]"
          autoresize
          v-if="!loading"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import useApi from '../services/histrixApi.js';
import HistrixFilters from './HistrixFilters.vue';

// Registra los componentes necesarios de ECharts
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
]);

export default {
  name: 'HistrixChart',
  components: {
    HistrixFilters,
    VChart
  },
  props: {
    path: {
      type: String,
      default: ''
    },
    query: {
      type: String,
      default: ''
    },
    styles: {
      type: String,
      default: ''
    },
    schema: {
      type: Object,
      default: () => ({})
    },
    resources: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    const { getData } = useApi();
    return { getData };
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
      chartOptions: {},
      chartTypes: [],
      defaultOptions: {
        title: { text: '' },
        grid: {
          bottom: '20%',
          left: '5%',
          top: '10%'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0
        },
        tooltip: {
          show: true
        },
        dataset: {
          dimensions: [],
          source: []
        },
        xAxis: {},
        yAxis: {},
        series: []
      }
    };
  },
  mounted() {
    const url = this.xmlUrl();
    this.getData(url);
  },
  watch: {
    path(_newVal, _oldVal) {
      const url = this.xmlUrl();
      this.getData(url);
    },
    chartTypes(newVal, _oldVal) {
      console.log(newVal.key);
    }
  },
  methods: {
    xmlUrl(query) {
      return `${this.schema.api}/app/${this.path}?${query || ''}`;
    },
    setChartOptions(data) {
      let series = [];
      const types = this.types;
      this.schema.charts.map((chart) => {
        // Clonar defaultOptions para evitar mutaciones
        const options = JSON.parse(JSON.stringify(this.defaultOptions));
        options.title.text = chart.titulo;
        options.title.subtext = chart.subtitulo;
        const label = chart.etiquetas;
        
        if (chart.tipo === 'P') {
          options.xAxis = null;
          options.yAxis = null;
          series = this.getDataIfIsPie(chart, data);
        } else {
          options.dataset.dimensions = Object.keys(chart.series);
          series = Object.keys(chart.series).map((serie) => {
            const xaxis = [];
            const newdata = [];
            data.map((item) => {
              newdata.push(item[serie]);
              xaxis.push(item[label]);
            });
            options.xAxis.data = xaxis;
            return {
              name: this.schema.fields[serie].title,
              type: types[chart.tipo],
              stack: chart.tipo === 'SC' ? 'A' : null,
              data: newdata
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
        const tempArray = [];
        for (const key of keysSerie) {
          const newdata = data.map((item) => ({
            value: item[key],
            name: this.schema.fields[key].title
          }));
          tempArray.push(newdata);
        }
        series = [
          {
            name: chart.datos,
            type: this.types[chart.tipo],
            data: tempArray.flat()
          }
        ];
      } else {
        const newdata = data.map((item) => ({
          value: item[chart.datos],
          name: item[chart.etiquetas]
        }));
        series = [
          {
            name: chart.datos,
            type: this.types[chart.tipo],
            data: newdata
          }
        ];
      }
      return series;
    },
    getData(url) {
      this.getData(url)
        .then((response) => {
          this.setChartOptions(response.data.data);
          this.loading = false;
        })
        .catch((_e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    }
  }
};
</script>