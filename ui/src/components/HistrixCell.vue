<template>
  <div style="width: 100%">
    <q-img v-if="hasMap" :src="LinkMap" spinner-color="white" />
    <!-- @TODO: Sacar esto a un componente aparte -->
    <div v-else-if="hasThumb">
      <q-img :src="thumb" spinner-color="white" @click="showImage = true" />
      <q-dialog v-model="showImage">
        <q-card style="width: 700px; max-width: 80vw">
          <q-card-section class="row items-center q-pb-none">
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-img :src="thumb" spinner-color="white"> </q-img>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <q-btn
      v-else-if="
        (col.value && col.value.link && col.value.text) ||
        (col.link && col.value)
      "
      :_to="link"
      class="fit"
      dense
      size="sm"
      :style="col.value.button_style"
      :icon="icon"
      @click="
        $emit('open-popup', {
          link: col.value && col.value.link ? col.value.link : null,
          title: col.value.text,
          parameters: col.value['linkParameters'],
        })
      "
    >
      {{ text }}
    </q-btn>
    <q-icon v-else-if="isCheck" :name="checkIcon"> </q-icon>
    <q-linear-progress
      v-else-if="isProgress"
      :value="col.value.value / 100"
      color="accent"
      size="20px"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="transparent"
          text-color="black"
          :label="col.value.value"
        />
      </div>
    </q-linear-progress>
    <div v-else v-html="formatedValue" :class="schema.class"></div>
    <!--
    <q-btn icon="cloud_upload" v-if="isAwsUploader"
    @click="$emit('open-popup', {url: awsData.url, title: awsData.title || ''})"
    >
      {{awsData.title || ''}}
    </q-btn>
       // TODO IMPLEMENT PROGRESS METER
    -->
  </div>
</template>

<script>
import useApi from '../services/histrixApi.js';

export default {
  name: 'HistrixCell',
  setup() {
    const { apiUrl, host, currentDb } = useApi();
    return { apiUrl, host, currentDb };
  },
  props: {
    schema: Object,
    value: Object,
    col: Object,
    path: String
  },
  computed: {
    thumb() {
      if (this.col.value.thumb) {
        return `${this.apiUrl()}/thumb/${this.col.value.computedPath}`;
      }
      return null;
    },
    isProgress() {
      return this.schema.histrix_type === 'Grafico';
    },
    hasThumb() {
      return !!this.col?.value?.thumb;
    },
    hasMap() {
      if (!this.schema) return false;
      return this.schema.histrix_type === 'Map';
    },
    keyGoogleMapsStatic() {
      if (!this.hasMap) return '';
      if (!this.$attrs?.props?.row?.staticKey?._) return '';
      return this.$attrs.props.row.staticKey._;
    },
    LinkMap() {
      if (!this.hasMap) return false;
      return `https://maps.googleapis.com/maps/api/staticmap?&zoom=7&size=300x300&markers=${this.innerValue}&format=png&style=feature:road|visibility:off&style=feature:administrative.province|element:geometry|weight:3.38|color:0x1e00e6&key=${this.keyGoogleMapsStatic}`;
    },
    link() {
      if (this.col?.value?.link) {
        const { link } = this.col.value;
        // var path = (dir || this.dirname(this.path)) + link.file;
        let path = `${link.dir}/${link.file}`;

        if (link.dir == null) {
          path = `/${this.dirname(this.path)}/${link.file}`;
        }
        const finalLink = `/auth/app${path}?${this.col.value.linkParameters}`;
        return finalLink.replace('//', '/');
      }
      return false;
    },

    icon() {
      return this.mapIcon(this.col.value.link_icon);
    },
    text() {
      if (this.col.value.link_text !== 'false') {
        return this.col.value.text;
      }
      return ' ';
    },

    innerValue() {
      if (typeof this.col.value === 'object' && this.col.value !== null) {
        return this.col.value.value !== undefined ? this.col.value.value : this.col.value._;
      }

      return this.col.value;
    },
    displayValue() {
      let value =
        this.col.value && this.col.value.value !== undefined
          ? this.col.value.value
          : this.col.value?._
            ? this.col.value._
            : null;
      value = value !== undefined ? value : this.col.value;
      if (this.hasOptions) {
        if (this.checkIsArray(value)) {
          return JSON.parse(value)
            .map((v) => Object.entries(this.hasOptions[v])[0][1])
            .join(', ');
        }
        const option = this.hasOptions[value];
        if (typeof option === 'object') {
          return Object.entries(this.hasOptions[value])[0][1];
        }
        return option;
      }

      if (typeof this.col.value === 'object' && this.col.value !== null) {
        return this.col.value._ ? this.col.value._ : this.col.value.value;
      }

      return this.col.value;
    },
    isAwsUploader() {
      return this.col.value?._ ? this.col.value._.indexOf('awsuploader') !== -1 : false;
    },
    awsData() {
      const test_element = document.createElement('div');
      test_element.innerHTML = this.col.value._;
      let aws = { title: ' ' };

      if (test_element.childNodes[0]) {
        const element = test_element.childNodes[0];
        aws = {
          table: element.getAttributeNode('data-table').value,
          recid: element.getAttributeNode('data-recid').value,
          title: element.innerText
        };
        aws.url = `${this.host()}/uploader/?table=${aws.table}&recid=${aws.recid}&db=${this.currentDb()}`;
      }
      if (test_element.childNodes[1]) {
        const element = test_element.childNodes[1];
        aws = {
          table: element.getAttributeNode('data-table').value,
          recid: element.getAttributeNode('data-recid').value,
          title: element.innerText
        };
        aws.url = `${this.host()}/uploader/?table=${aws.table}&recid=${aws.recid}&db=${this.currentDb()}`;
      }
      return aws;
    },
    formatedValue() {
      if (this.schema.histrix_type === 'Numeric') {
        return Number.parseFloat(this.col.value._ || 0).toLocaleString('es-AR', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });
      }
      return this.displayValue;
    },
    hasOptions() {
      return this.schema.options;
    },
    checkIcon() {
      return this.innerValue === 0 ? 'check_box_outline_blank' : 'check';
    },
    isCheck() {
      if (this.schema) {
        return this.schema.histrix_type === 'Check';
      }
      return false;
    }
  },
  methods: {
    checkIsArray(value) {
      try {
        const temp = JSON.parse(value);
        return Array.isArray(temp);
      } catch (_error) {
        return false;
      }
    },
    dirname(path) {
      return path.match(/.*\//);
    },
    mapIcon(icon) {
      const iconset = {
        'ui-icon-blank': '',
        'ui-icon-camera': 'camera_alt',
        'ui-icon-caret-1-n': '',
        'ui-icon-caret-1-ne': '',
        'ui-icon-caret-1-e': '',
        'ui-icon-caret-1-se': '',
        'ui-icon-caret-1-s': '',
        'ui-icon-caret-1-sw': '',
        'ui-icon-caret-1-w': '',
        'ui-icon-caret-1-nw': '',
        'ui-icon-caret-2-n-s': '',
        'ui-icon-caret-2-e-w': '',
        'ui-icon-triangle-1-n': '',
        'ui-icon-triangle-1-ne': '',
        'ui-icon-triangle-1-e': '',
        'ui-icon-triangle-1-se': '',
        'ui-icon-triangle-1-s': '',
        'ui-icon-triangle-1-sw': '',
        'ui-icon-triangle-1-w': '',
        'ui-icon-triangle-1-nw': '',
        'ui-icon-triangle-2-n-s': '',
        'ui-icon-triangle-2-e-w': '',
        'ui-icon-arrow-1-n': '',
        'ui-icon-arrow-1-ne': '',
        'ui-icon-arrow-1-e': '',
        'ui-icon-arrow-1-se': '',
        'ui-icon-arrow-1-s': '',
        'ui-icon-arrow-1-sw': '',
        'ui-icon-arrow-1-w': '',
        'ui-icon-arrow-1-nw': '',
        'ui-icon-arrow-2-n-s': '',
        'ui-icon-arrow-2-ne-sw': '',
        'ui-icon-arrow-2-e-w': '',
        'ui-icon-arrow-2-se-nw': '',
        'ui-icon-arrowstop-1-n': '',
        'ui-icon-arrowstop-1-e': '',
        'ui-icon-arrowstop-1-s': '',
        'ui-icon-arrowstop-1-w': '',
        'ui-icon-arrowthick-1-n': '',
        'ui-icon-arrowthick-1-ne': '',
        'ui-icon-arrowthick-1-e': '',
        'ui-icon-arrowthick-1-se': '',
        'ui-icon-arrowthick-1-s': '',
        'ui-icon-arrowthick-1-sw': '',
        'ui-icon-arrowthick-1-w': '',
        'ui-icon-arrowthick-1-nw': '',
        'ui-icon-arrowthick-2-n-s': '',
        'ui-icon-arrowthick-2-ne-sw': '',
        'ui-icon-arrowthick-2-e-w': '',
        'ui-icon-arrowthick-2-se-nw': '',
        'ui-icon-arrowthickstop-1-n': '',
        'ui-icon-arrowthickstop-1-e': '',
        'ui-icon-arrowthickstop-1-s': '',
        'ui-icon-arrowthickstop-1-w': '',
        'ui-icon-arrowreturnthick-1-w': '',
        'ui-icon-arrowreturnthick-1-n': '',
        'ui-icon-arrowreturnthick-1-e': '',
        'ui-icon-arrowreturnthick-1-s': '',
        'ui-icon-arrowreturn-1-w': '',
        'ui-icon-arrowreturn-1-n': '',
        'ui-icon-arrowreturn-1-e': '',
        'ui-icon-arrowreturn-1-s': '',
        'ui-icon-arrowrefresh-1-w': '',
        'ui-icon-arrowrefresh-1-n': '',
        'ui-icon-arrowrefresh-1-e': '',
        'ui-icon-arrowrefresh-1-s': '',
        'ui-icon-arrow-4': '',
        'ui-icon-arrow-4-diag': '',
        'ui-icon-bucket': 'storage',
        'ui-icon-extlink': '',
        'ui-icon-newwin': '',
        'ui-icon-refresh': '',
        'ui-icon-shuffle': '',
        'ui-icon-transfer-e-w': '',
        'ui-icon-truck': 'airport_shuttle',
        'ui-icon-transferthick-e-w': '',
        'ui-icon-folder-collapsed': 'folder',
        'ui-icon-folder-open': 'folder_open',
        'ui-icon-document': 'description',
        'ui-icon-document-b': 'insert_drive_file',
        'ui-icon-note': 'note',
        'ui-icon-mail-closed': 'email',
        'ui-icon-mail-open': 'drafts',
        'ui-icon-suitcase': 'work',
        'ui-icon-comment': 'comment',
        'ui-icon-user': 'person',
        'ui-icon-person': 'person',
        'ui-icon-print': 'print',
        'ui-icon-trash': 'delete',
        'ui-icon-locked': 'lock',
        'ui-icon-unlocked': 'lock_open',
        'ui-icon-bookmark': 'bookmark',
        'ui-icon-tag': 'label',
        'ui-icon-home': 'home',
        'ui-icon-flag': 'flag',
        'ui-icon-calculator': '',
        'ui-icon-cart': 'shopping_cart',
        'ui-icon-pencil': 'create',
        'ui-icon-clock': 'schedule',
        'ui-icon-disk': '',
        'ui-icon-calendar': 'calendar_today',
        'ui-icon-zoomin': 'zoom_in',
        'ui-icon-zoomout': 'zoom_out',
        'ui-icon-search': '',
        'ui-icon-wrench': 'build',
        'ui-icon-gear': 'settings',
        'ui-icon-heart': '',
        'ui-icon-star': '',
        'ui-icon-link': '',
        'ui-icon-cancel': 'cancel',
        'ui-icon-plus': 'add',
        'ui-icon-plusthick': 'add',
        'ui-icon-minus': '',
        'ui-icon-minusthick': '',
        'ui-icon-close': 'close',
        'ui-icon-closethick': 'close',
        'ui-icon-key': '',
        'ui-icon-lightbulb': '',
        'ui-icon-scissors': '',
        'ui-icon-clipboard': '',
        'ui-icon-copy': '',
        'ui-icon-contact': '',
        'ui-icon-image': '',
        'ui-icon-video': '',
        'ui-icon-script': '',
        'ui-icon-alert': '',
        'ui-icon-info': 'info',
        'ui-icon-notice': '',
        'ui-icon-help': '',
        'ui-icon-check': '',
        'ui-icon-bullet': '',
        'ui-icon-radio-off': '',
        'ui-icon-radio-on': '',
        'ui-icon-pin-w': '',
        'ui-icon-pin-s': '',
        'ui-icon-play': '',
        'ui-icon-pause': '',
        'ui-icon-phone': 'phone',
        'ui-icon-seek-next': '',
        'ui-icon-seek-prev': '',
        'ui-icon-seek-end': '',
        'ui-icon-seek-first': '',
        'ui-icon-stop': '',
        'ui-icon-eject': '',
        'ui-icon-volume-off': '',
        'ui-icon-volume-on': '',
        'ui-icon-power': '',
        'ui-icon-signal-diag': '',
        'ui-icon-signal': '',
        'ui-icon-battery-0': '',
        'ui-icon-battery-1': '',
        'ui-icon-battery-2': '',
        'ui-icon-battery-3': '',
        'ui-icon-circle-plus': 'add_circle',
        'ui-icon-circle-minus': '',
        'ui-icon-circle-close': '',
        'ui-icon-circle-triangle-e': '',
        'ui-icon-circle-triangle-s': '',
        'ui-icon-circle-triangle-w': '',
        'ui-icon-circle-triangle-n': '',
        'ui-icon-circle-arrow-e': '',
        'ui-icon-circle-arrow-s': '',
        'ui-icon-circle-arrow-w': '',
        'ui-icon-circle-arrow-n': '',
        'ui-icon-circle-zoomin': '',
        'ui-icon-circle-zoomout': '',
        'ui-icon-circle-check': '',
        'ui-icon-circlesmall-plus': '',
        'ui-icon-circlesmall-minus': '',
        'ui-icon-circlesmall-close': '',
        'ui-icon-structure': 'apartment',
        'ui-icon-squaresmall-plus': '',
        'ui-icon-squaresmall-minus': '',
        'ui-icon-squaresmall-close': '',
        'ui-icon-grip-dotted-vertical': '',
        'ui-icon-grip-dotted-horizontal': '',
        'ui-icon-grip-solid-vertical': '',
        'ui-icon-grip-solid-horizontal': '',
        'ui-icon-gripsmall-diagonal-se': '',
        'ui-icon-grip-diagonal-se     ': ''
      };

      return iconset[icon];
    }
  },
  data() {
    return {
      showImage: false
    };
  },
  mounted() {
    //
  }
};
</script>
