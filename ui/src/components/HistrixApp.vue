<template>
  <div>
    <div class="fit" v-if="isPdf" style="position: absolute">
      <q-pdfviewer v-bind="$attrs" v-model="show" :src="pdfSrc" type="html5" />
    </div>
    <q-dialog class="fit" v-model="showPdfPopup">
      <q-pdfviewer
        v-bind="$attrs"
        v-model="showPdfPopup"
        :src="pdfSrc"
        type="html5"
      />
    </q-dialog>
    <template v-if="!isPdf">
      <q-splitter
        v-model="finalSplitterModel"
        class="fit"
        style="overflow: hidden"
        :limits="[0, Infinity]"
        :separator-class="this.smallscreen || !hasFullDetail ? 'hidden' : ''"
      >
        <template v-slot:before>
          <div v-if="!hasStepper">
            <component
              v-if="!hasStepper"
              ref="main"
              v-bind:is="histrixComponent"
              v-bind="$attrs"
              :path="path"
              :query="componentQuery"
              :resources="resources"
              :schema="schema"
              :finalStep="finalStep"
              v-model="localValue"
              :inner="inner"
              :title="title"
              :url="xmlUrl"
              :styles="styles"
              :editedItem="schema.values"
              :computedFields="computedFields"
              :computedTotals="computedTotals"
              v-on:open-detail="openDetail"
              v-on:open-popup="showLinkDialog"
              v-on:closepopup="closePopup"
              v-on:computed-total="onComputedTotal"
              v-on:select-row="selectRow"
              v-on:export="showExportForm"
              v-on:print="togglePdf"
              v-on:input="$emit('input', localValue)"
              v-on:validity="onValidityChange"
              v-on:advance-step="$emit('advance-step')"
              v-on:process-finish="refreshMaster"
            >
              <template v-slot:slot-top-form="props">
                <slot name="slot-top-form" :props="props.props" />
              </template>
              <template v-slot:slot-top-field-histrixapp="props">
                <slot name="slot-top-field-histrixapp" :props="props.props" />
              </template>
              <template v-slot:slot-botton-form="props">
                <slot name="slot-botton-form" :props="props.props" />
              </template>
            </component>
            <div class="row justify-center">
              <div class="q-pa-sm">
                <q-btn
                  icon="thumb_up"
                  :disable="!validity"
                  label="procesar "
                  class="bg-secondary text-white nojustify-end"
                  @click="process"
                  v-if="schema.can_process && !inner"
                />
              </div>
            </div>
          </div>
          <q-stepper
            v-if="hasStepper"
            v-model="step"
            keep-alive
            color="primary"
            animated
          >
            <q-step
              :name="1"
              :title="title || schema.title"
              icon="settings"
              :done="step > 1"
            >
              <component
                ref="main"
                v-bind:is="histrixComponent"
                v-bind="$attrs"
                :path="path"
                :query="componentQuery"
                :resources="resources"
                :schema="schema"
                v-model="localValue"
                :inner="inner"
                :title="title"
                :url="xmlUrl"
                :styles="styles"
                :editedItem="schema.values"
                :computedFields="computedFields"
                :computedTotals="computedTotals"
                v-on:open-detail="openDetail"
                v-on:open-popup="showLinkDialog"
                v-on:closepopup="closePopup"
                v-on:computed-total="onComputedTotal"
                v-on:select-row="selectRow"
                v-on:export="showExportForm"
                v-on:print="togglePdf"
                v-on:input="$emit('input', localValue)"
                v-on:validity="onValidityChange"
                v-on:advance-step="step++"
              ></component>

              <q-stepper-navigation>
                <q-btn
                  @click="step++"
                  color="primary"
                  label="Continuar"
                  :disable="!validity"
                  icon="navigate_next"
                />
              </q-stepper-navigation>
            </q-step>

            <q-step
              :name="2"
              title="Confirmación"
              icon="done_all"
              :done="step > 2"
            >
              <HistrixApp
                ref="detail"
                v-if="schema.process_next_step.xml != ''"
                :path="
                  schema.process_next_step.dir +
                  '/' +
                  schema.process_next_step.xml
                "
                :query="processNextStepQuery"
                :finalStep="true"
                v-on:advance-step="finishStep"
              />
              <q-stepper-navigation>
                <q-btn
                  flat
                  @click="step--"
                  color="primary"
                  label="Atras"
                  icon="navigate_before"
                  class="q-ml-sm"
                />
                <q-btn
                  @click="finishStep"
                  color="primary"
                  label="CONFIRMAR"
                  icon="check"
                />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </template>
        <template v-slot:after>
          <HistrixApp
            ref=""
            v-if="detailPath != ''"
            :path="detailPath"
            :query="detailQuery"
            v-on:process-finish="refreshMaster"
          />
          <q-page-sticky position="bottom-right" :offset="[20, 10]">
            <q-btn
              icon="arrow_back"
              color="accent"
              fab
              @click="closeDetail()"
              v-if="smallscreen && isDetailOpened"
            />
          </q-page-sticky>
        </template>
      </q-splitter>
    </template>

    <!--
    <q-banner
      inline-actions
      class="text-white bg-red"
      v-if="this.componentType == 'notyet'"
    >
      <template v-slot:avatar>
        <q-icon name="mood_bad" color="white" />
      </template>
      type {{ schema.type }} not yet implemented
    </q-banner>
-->

    <q-dialog
      v-model="showIframe"
      full-width
      :auto-close="false"
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card>
        <iframe :src="iframe" width="100%" height="500px"> </iframe>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="linkDialog"
      full-width
      :maximized="$q.platform.is.mobile ? true : false"
      transition-show="slide-down"
      transition-hide="slide-up"
      @before-hide="closePopup"
    >
      <q-layout view="Lhh lpR fff" container class="bg-white">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-toolbar-title>{{
              innerQuery._title || this.dialogTitle
            }}</q-toolbar-title>
            <q-btn flat @click="linkDialog = false" round dense icon="close" />
          </q-toolbar>
        </q-header>
        <!--
        <q-footer class="bg-black text-white">
          <q-toolbar inset>
            <q-toolbar-title>Footer</q-toolbar-title>
          </q-toolbar>
        </q-footer>
-->
        <!--
        <q-drawer bordered v-model="drawer" :width="200" :breakpoint="600" content-class="bg-grey-3 q-pa-sm">
          <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
        </q-drawer>

        <q-drawer side="right" bordered v-model="drawerR" :width="200" :breakpoint="300" content-class="bg-grey-3 q-pa-sm">
          <div v-for="n in 50" :key="n">Drawer {{ n }} / 50</div>
        </q-drawer>
-->
        <q-page-container>
          <q-page>
            <HistrixApp
              :path="innerPath"
              :query="innerQuery"
              :title="innerQuery._title"
              class="col"
              v-on:closepopup="closePopup"
            />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>

    <q-dialog v-model="exportDialog" position="top">
      <q-card style="auto">
        <q-card-section class="row items-center no-wrap">
          <ExportForm
            :schema="schema"
            :path="path"
            :query="query"
            :exportQuery="exportQuery"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialog" position="top">
      <q-card style="auto">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">{{ message }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!--
    <q-footer v-if="pdf">
      <q-toolbar v-if="pdf">
        <q-toolbar-title>
          <q-btn
            icon="list"
            label="Consulta"
            class="bg-secondary text-white"
            @click="togglePdf()"
            v-if="pdf"
          />
          <q-btn icon="thumb_up" label="procesar " class=" bg-secondary text-white nojustify-end" @click="$refs.main.processData()" v-if="schema.can_process" />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
    -->
  </div>
</template>

<script>
import histrixApi from '../services/histrixApi.js';

import ExportForm from './ExportForm.vue';

// Importación estática arriba del archivo
import HistrixForm from './HistrixForm.vue';
import HistrixCalendar from './HistrixCalendar.vue';
import HistrixDashboard from './HistrixDashboard.vue';
import HistrixTree from './HistrixTree.vue';
import HistrixChart from './HistrixChart.vue';
import HistrixList from './HistrixList.vue';
import HistrixTable from './HistrixTable.vue';

export default {
  name: 'HistrixApp',
  props: {
    path: String,
    query: Object,
    styles: String,
    title: String,
    inner: Boolean,
    pdf: {
      type: Boolean,
      default: false
    },
    value: null,
    database: {
      type: String,
      required: false
    },
    api: {
      type: String,
      required: false
    },
    finalStep: Boolean
  },
  components: {
    ExportForm
  },
  beforeMount() {
    //
  },
  mounted() {
    this.getSchema();
    this.detailQuery = {};
    this.detailPath = '';
    this.closeDetail();
    this.localValue = this.value;
  },
  watch: {
    /**
     * If Path or Query parameters changes then reload all and reset data
     */
    value: {
      handler(_newVal, _oldVal) {
        this.localValue = this.value;
      }
    },
    xmlUrl: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.getSchema();
          this.step = 1; // reset stepper
          this.detailQuery = {};
          this.detailPath = '';
        }
      }
    }
  },
  computed: {
    componentQuery() {
      return { ...this.$route.query, ...this.query };
    },
    redirectPage() {
      if (!this.schema || !this.schema.redirect) return null;
      return this.schema.redirect;
    },
    user() {
      return localStorage.getItem('user');
    },
    hasStepper() {
      if (this.schema?.process_next_step) {
        if (this.schema.process_next_step.condition && this.localValue !== undefined) {
          const condition = this.schema.process_next_step.condition;
          return this.schema.process_next_step && this.localValue[condition];
        }
        return true;
      }
    },
    processNextStepQuery() {
      const data = {};
      const targets = this.schema.process_next_step.query;
      if (targets) {
        Object.keys(targets).map((key) => {
          if (this.localValue) {
            data[key] = this.localValue[targets[key]];
          }
        });
        return data;
      }
    },
    /**
     * full App Url
     */
    xmlUrl() {
      const url = `${this.path}?${this.queryString}`;
      return url.replace('//', '/');
    },
    /**
     * Query String: merge browser query string with query props
     */
    queryString() {
      const query = { ...this.$route.query, ...this.query };
      return Object.keys(query)
        .map((key) => {
          // do not send objects in params
          if (typeof query[key] !== 'object') {
            return `${key}=${query[key]}`;
          }
        })
        .join('&');
    },
    /**
     * map of computed field and formulas
     */
    computedFields() {
      const computedFields = {};
      if (this.schema.fields) {
        Object.entries(this.schema.fields).map((field) => {
          if (field[1].computed_fields) {
            Object.entries(field[1].computed_fields).map((formula) => {
              computedFields[formula[0]] = formula[1];
            });
          }
        });
      }
      return computedFields;
    },
    /**
     * map of computed totals source and targets
     * when a table computes totals where that values goes
     * ex:  field 1 column sum goes to field X
     */
    computedTotals() {
      const computedTotals = {};
      if (this.schema.fields) {
        Object.entries(this.schema.fields).map((field) => {
          if (field[1].computed_totals) {
            Object.entries(field[1].computed_totals).map((formula) => {
              computedTotals[formula[0]] = field[0];
            });
          }
        });
      }
      return computedTotals;
    },
    /**
     * Default splitter Model
     */
    finalSplitterModel() {
      if (this.isDetailOpened && this.hasFullDetail) {
        return this.smallscreen ? 0 : 30;
      }
      return 99.9;
    },
    smallscreen() {
      return this.$q.screen.lt.md;
    },
    hasDetail() {
      return this.schema.detail;
    },
    /**
     * tru if detail is not inline
     */
    hasFullDetail() {
      return this.hasDetail && !this.schema.inline_detail;
    },
    //TODO: cambiar
    // componentFile() {
    //   return httpVueLoader(this.vueUrl);
    // },
    /**
     * database id
     */
    databaseId() {
      return this.database ? this.database : histrixApi.currentDb();
    },
    /**
     * url api endpoint
     */
    apiUrl() {
      return this.api ? this.api : histrixApi.apiUrl();
    },
    /**
     * select apropiate component to render
     */
    histrixComponent() {
      const map = {
        ficha: HistrixForm,
        fichaing: HistrixForm,
        cabecera: HistrixForm,
        calendar: HistrixCalendar,
        gantt: HistrixCalendar,
        dashboard: HistrixDashboard,
        tree: HistrixTree,
        arbol: HistrixTree,
        treeView: HistrixChart,
        map: HistrixChart,
        chart: HistrixChart,
        list: HistrixList,
        consulta: HistrixTable,
        crud: HistrixTable,
        abm: HistrixTable,
        ing: HistrixTable,
        grid: HistrixTable,
        liveGrid: HistrixTable,
        help: HistrixTable,
        ayuda: HistrixTable,
        'abm-mini': HistrixTable
      };

      return map[this.schema.type] || null;
    },
    isPdf() {
      if (this.schema.pdf || this.pdf) {
        this.fetchPDF();
        return true;
      }
      return false;
    },
    /**
     * SSR vue APi endpoint
     */
    vueUrl() {
      return `${this.apiUrl}/vue/${this.path}`;
    },
    hash() {
      return `${this.databaseId}.${this.path}`.replace(/\//g, '__');
    }
  },
  methods: {
    hashcode(s) {
      return Math.abs(
        s.split('').reduce((a, b) => {
          const result = (a << 5) - a + b.charCodeAt(0);
          return result & result;
        }, 0)
      );
    },
    subscribeWamp() {
      if (this.$wamp) {
        this.$wamp
          .subscribe(
            this.hash,
            (_args, kwArgs, details) => {
              // component context is available
              console.log('args');
              console.log(kwArgs);
              console.log('details');
              console.log(details);
              this.$q.notify({
                message: 'Xml utilizado',
                type: 'info',
                textColor: 'white',
                color: 'info',
                icon: 'info',
                closeBtn: 'cerrar',
                position: 'top'
              });
            },
            {
              acknowledge: true // option needed for promise, automatically added
            }
          )
          .then((s) => {
            console.log('AutobahnJS Subscription object: ', s);
          });
      }
    },
    refreshMaster(_doRefresh) {
      //this.$refs.main.refresh()
      this.$emit('process-finish', true);
      if (this.redirectPage) {
        this.$router.push(this.redirectPage);
      }
    },
    onValidityChange(validity) {
      this.validity = validity;
    },
    /**
     * this will process al containers within STEPS
     */
    finishStep() {
      alert('must finis step');
    },
    /**
     * emit event to parent component selected Row
     */
    selectRow(row) {
      this.$emit('select-row', row);
    },
    /**
     * emit event to parent component computed Totals
     */
    onComputedTotal(data) {
      this.$emit('computed-total', data);
    },
    /**
     * Open detail with row Attributes
     */
    openDetail($rowAttr) {
      this.selected = $rowAttr;
      this.detailQuery = new URLSearchParams($rowAttr.detailquery);
      this.detailPath = $rowAttr.detailpath;
      this.isDetailOpened = true;
    },
    process() {
      this.validity = false;
      this.$refs.main.processData();
    },
    closeDetail() {
      this.isDetailOpened = false;
    },

    togglePdf() {
      this.fetchPDF();
      this.showPdfPopup = true;
    },

    showExportForm(query) {
      this.exportQuery = query;
      this.exportDialog = true;
    },
    dirname(path) {
      return path.match(/.*\//);
    },
    closePopup() {
      console.log('test');
      this.refreshMaster();
      this.linkDialog = false;
      this.$emit('closepopup');
    },
    getDialogTitle(data) {
      const title = [];
      const schema = this.schema;
      console.log(data);
      const _attrs = data.DT_RowAttr;
      Object.entries(data).map((value) => {
        const field = schema.fields[value[0]];
        if (value[1] !== '' && field && !field.hidden && field.histrix_type === 'Varchar') {
          console.log(field);
          const val = value[1].replace(/<[^>]*>?/gm, '');
          title.push(val);
        }
      });
      return title.join(' - ');
    },
    showLinkDialog(data) {
      if (data.url) {
        this.iframe = data.url;
        this.dialogTitle = `${data.title}`;
        this.showIframe = true;
        return;
      }

      const title = this.getDialogTitle(data.row);
      const link = data.link;
      //var path = (dir || this.dirname(this.path)) + link.file;
      let path = `${link.dir}/${link.file}`;

      if (link.dir == null) {
        path = `/${this.dirname(this.path)}/${link.file}`;
      }

      this.innerPath = path.replace('//', '/');
      const queryString = `{"${decodeURI(data.parameters.substring(1))
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')}"}`;
      this.innerQuery = JSON.parse(queryString);
      this.linkDialog = true;
      this.dialogTitle = `${data.title}: ${title}`;
    },
    /**
     * get PDF blob data
     */
    fetchPDF() {
      histrixApi
        .getAppPdf(this.path, this.query)
        .then((res) => {
          // create the blob
          const blob = new Blob([res.data], {
            type: res.headers['content-type']
          });

          // set reactive variable
          this.pdfSrc = window.URL.createObjectURL(blob);
        })
        .catch((err) => {
          console.log(err);
          this.$q.notify({
            message: 'Error downloading PDF',
            type: 'negative',
            textColor: 'white',
            color: 'negative',
            icon: 'error',
            closeBtn: 'close',
            position: 'top'
          });
        });
    },
    /**
     * compute Field column class
     */
    columnClasses(field) {
      let columnClass = '';
      if (field.sum === 'true') {
        columnClass += ' bg-light-green-12 text-black ';
      }
      if (field.esClave === 'true') {
        columnClass += ' text-red ';
      }
      return columnClass;
    },
    /**
     * get Schema from API
     */
    getSchema() {
      histrixApi
        .getAppSchema(this.path, this.query)
        .then((response) => {
          this.resources = response.data.resources;
          this.schema = response.data.schema;
          // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
          if (this.schema.hasOwnProperty('fields')) {
            this.buildColumns();
          }

          this.schema.api = this.apiUrl;
          // this.$wamp.publish(this.hash, [], { xml: this.path })
          this.subscribeWamp();
        })
        .catch((e) => {
          this.dialog = true;
          this.message = `Error de Carga${e}`;
        });
    },
    /**
     * build columns structure for q-tables
     */
    buildColumns() {
      const fields = this.schema.fields;

      const columns = [];
      columns.push({
        name: '_id',
        label: 'rowid',
        field: '_id',
        hidden: true,
        style: null,
        align: null,
        classes: null,
        sortable: false,
        sum: false
      });

      Object.entries(fields).map((fieldArray, _i) => {
        const field = fieldArray[1];
        columns.push({
          name: field.name,
          label: field.title,
          field: field.name,
          hidden: field.hidden_column,
          style: field.column_style,
          align: field.align,
          classes: this.columnClasses(field),
          sortable: field.sortable,
          sum: field.sum,
          headerClasses: 'bg-primary text-white'
        });
      }, this);
      this.schema.columns = columns;
    }
  },
  data() {
    return {
      step: 1, // default initial Step
      validity: true,
      showPdfPopup: false,
      // pdf: false, // ya estaba en props deje ahi default false
      pdfSrc: '',
      show: true,
      message: null,
      dialog: false,
      exportQuery: null,
      exportDialog: false, // show export Dialog
      linkDialog: false, // show inner link Dialog
      iframe: null, //  iframe url
      showIframe: false, // show inner link Dialog
      dialogTitle: '',
      innerPath: '', //  inner link
      innerQuery: '', //  inner link
      resources: null,
      localValue: {},
      // splitterModel: 40,
      isDetailOpened: false,
      schema: {
        type: '',
        title: null,
        filters: [],
        fields: [],
        columns: [],
        values: {}
      },
      data: [],
      selected: null,
      detailQuery: '',
      detailPath: ''
    };
  }
};
</script>
<style>
.q-splitter__before,
.q-splitter__after {
  overflow: inherit;
}
</style>
