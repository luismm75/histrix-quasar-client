<template>
  <q-page >
     <q-dialog v-model="displayEvent">
      <q-card v-if="event">
        <q-toolbar  style="min-width: 400px;">
          <q-toolbar-title>
            {{ event.title }}
          </q-toolbar-title>
          <q-btn flat round   icon="delete" v-close-popup @click="deleteEvent(event)"></q-btn>
          <q-btn flat round   icon="edit" v-close-popup @click="editEvent(event)"></q-btn>
          <q-btn flat round   icon="cancel" v-close-popup></q-btn>
        </q-toolbar>
        <q-card-section class="inset-shadow">
          <div v-if="event.allDay" class="text-caption">{{ getEventDate(event) }}</div>
          {{ event.details }}
          <div v-if="event.time" class="text-caption">
            <pre>
              Start Time: {{ event.time }}
              End Time:   {{ getEndTime(event) }}
              Duration:   {{ event.duration }}
            </pre>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-toolbar>
      <q-toolbar-title>
        <HistrixFilters dense :schema="schema" v-on:filter-data="getData(xmlUrl($event))"/>
      </q-toolbar-title>

        <q-btn flat dense label="Today" class="q-mx-md" @click="calendarToday"></q-btn>
        <q-btn flat dense round icon="keyboard_arrow_left" @click="calendarPrev"></q-btn>
        <q-btn flat dense round icon="keyboard_arrow_right" @click="calendarNext"></q-btn>
        <span class="q-mr-xl q-toolbar__title nowrap">{{ title }}</span>
        <q-select
          v-model="calendarView"
          :options="viewOptions"
          outlined
          dense
          options-dense
          emit-value
          map-options
          style="min-width: 120px;"
        ></q-select>
    </q-toolbar>

  <q-calendar
    v-model="selectedDate"
    :view="calendarView"
    :resources="calendarResources"
    ref="calendar"
    :locale="locale"
  >

      <!-- Events in month View -->

      <template v-slot:day="day">
            <q-badge
              v-for="event in getEvents(day)"
              :key="event.id"
              :style="'width: 100%; cursor: pointer; background-color:' + event.color"
              class="ellipsis"
              :draggable="true"
               @click.stop.prevent="showEvent(event)"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon><span class="ellipsis">{{ event.title }}</span>
            </q-badge>
      </template>
      <template v-slot:intervals-header="day">
            <q-badge
              v-for="event in getEvents(day)"
              :key="event.id"
              :style="'width: 100%; cursor: pointer; background-color:' + event.color"
              class="ellipsis"
              :draggable="true"
               @click.stop.prevent="showEvent(event)"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon><span class="ellipsis">{{ event.title }}</span>
            </q-badge>
      </template>

      <template v-slot:day-header="day">
        <div class="row justify-center">
          <template v-for="(event, index) in getEvents(day)">
            <q-badge
              v-if="!event.time"
              :key="index"
              style="width: 100%; cursor: pointer;"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon><span class="ellipsis">{{ event.title }}</span>
            </q-badge>
            <q-badge
              v-else
              :key="index - 1000"
              class="q-ma-xs"

              style="width: 10px; max-width: 10px; height: 10px; max-height: 10px"
            />
          </template>
        </div>
      </template>

      <template v-slot:interval="day">
            <q-badge
              v-for="(event, index) in getDayEvents(day)"
              :key="index"
              :style="'width: 100%; cursor: pointer; background-color:' + event.color"
              class="ellipsis"
              :draggable="true"
               @click.stop.prevent="showEvent(event)"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon><span class="ellipsis">{{ event.title }}</span>
            </q-badge>
      </template>

  </q-calendar>
</q-page>
</template>

<script>
import histrixApi from '../services/histrixApi.js'

export default {
  name: 'HistrixCalendar',
  props: {
    schema: {},
    path: null,
    resources: {},
  },
  components: {
    HistrixFilters: () => import('./HistrixFilters.vue'),
  },
  computed: {
    view() {
      /*
        day
        2day
        3day
        4day
        5day
        6day
        week
        month
        scheduler
        day-scheduler
        2day-scheduler
        3day-scheduler
        4day-scheduler
        5day-scheduler
        6day-scheduler
        week-scheduler
        month-scheduler
        custom-scheduler
        day-agenda
        2day-agenda
        3day-agenda
        4day-agenda
        5day-agenda
        6day-agenda
        month-agenda
        week-agenda
        custom-agenda
        month-interval
        custom-interval
      */
      let view = 'month';
      switch (this.schema.defaultView) {
        case 'basicWeek':
          view = 'week';
          break;

        default:
          view = this.schema.defaultView;
          break;
      }
      return view;
    },
    localValue: {
      get() { return this.value; },
      set(localValue) { this.$emit('input', localValue); },
    },
    title() {
      if (this.titleFormatter && this.locale && this.selectedDate) {
        const date = new Date(this.selectedDate);
        return this.titleFormatter.format(date);
      }
      return '';
    },
  },
  methods: {
    onTitlebarResized(size) {
      this.titlebarHeight = size.height;
    },
    calendarNext() {
      this.$refs.calendar.next();
    },
    calendarPrev() {
      this.$refs.calendar.prev();
    },
    calendarToday() {
      this.selectedDate = this.formatDate();
    },
    formatDate(date) {
      const d = date !== void 0 ? new Date(date) : new Date();
      const month = `${  d.getMonth() + 1}`;
      const day = `${  d.getDate()}`;
      const year = d.getFullYear();
      return [year, this.padTime(month), this.padTime(day)].join('-');
    },
    padTime(val) {
      val = Math.floor(val);
      if (val < 10) {
        return `0${  val}`
      }
      return `${val  }`
    },
    isCssColor(color) {
      return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/);
    },
    showEvent(event) {
      this.event = event;
      this.displayEvent = true;
    },
    getEventDate(event) {
      const parts = event.start.split('-');
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return this.dateFormatter.format(date);
    },
    /*
    displayClasses(event) {
      return {
        [`bg-${event.bgcolor}`]: !this.isCssColor(event.bgcolor),
        'text-white': !this.isCssColor(event.bgcolor)
      }
    },
    displayStyles (event) {
      const s = {}
      if (this.isCssColor(event.bgcolor)) {
        s['background-color'] = event.bgcolor
        s.color = colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      return s
    },
    */
    xmlUrl(query) {
      return `${this.schema.api  }/app/${  this.path }?${ query || '' }&_dt=!&start=2020-01-01`
    },
    getData(url) {
      histrixApi.getData(url)
        .then((response) => {
          this.data = response.data;
        })
        .catch((e) => {
          this.dialog = true;
          this.message = 'Error de Carga de Datos';
        });
    },
    /*
    getDayEvents2 (dt) {
        console.log('--')
      console.log(dt )

       const currentDate = QCalendar.parsed(dt)
      const events = []
      for (let i = 0; i < this.data.length; ++i) {
        let added = false
        let event = this.data[i]

        event.time = event.start.substring(11, 20)
        event.date= event.start.substring(0, 10)
        event.duration = 5

        if (event.date === dt.date) {
          if (event.time) {
            if (event.time == dt.time) {

            }
             if (events.length > 0) {
              // check for overlapping times
              const startTime = QCalendar.parsed(event.date + ' ' + event.time)
              const endTime = QCalendar.addToDate(startTime, { minute: event.duration })
              for (let j = 0; j < events.length; ++j) {
                if (events[j].time) {
                  const startTime2 = QCalendar.parsed(events[j].date + ' ' + events[j].time)
                  const endTime2 = QCalendar.addToDate(startTime2, { minute: events[j].duration })
                  if (QCalendar.isBetweenDates(startTime, startTime2, endTime2) || QCalendar.isBetweenDates(endTime, startTime2, endTime2)) {
                    events[j].side = 'left'
                    event.side = 'right'
                    events.push(event)
                    added = true
                    break
                  }
                }
              }
             }
          }
          if (!added) {
            event.side = void 0
            events.push(event)
          }
        } else {
          // check for overlapping dates
          const startDate = QCalendar.parsed(event.date)
          const endDate = QCalendar.addToDate(startDate, { day: event.days })
          if (startDate) {

              if (QCalendar.isBetweenDates(dt, startDate, endDate)) {
                events.push(event)
              added = true
            }
          }
        }
      }
      console.log(dt.date)
      console.log(events)
      return events
    },
    */
    getDayEvents(day) {
      return this.data.filter(item => item.start.substring(0, 10) == day.date && item.start.substring(11, 20) == day.time);
    },

    getEvents(day) {
      return this.data.filter(item => item.start.substring(0, 10) == day.date);
    },
    updateFormatter() {
      try {
        this.dateFormatter = new Intl.DateTimeFormat(this.locale || void 0, {
          weekday: this.shortWeekdayLabel ? 'short' : 'long',
          month: this.shortMonthLabel ? 'short' : 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        });
      } catch (e) {
        console.error('Intl.DateTimeFormat not supported');
        this.dateFormatter = void 0;
      }
    },
  },
  beforeMount() {
    this.locale = this.$q.lang.getLocale() || 'es';

  },
  mounted() {
    this.updateFormatter();    
    const url = this.xmlUrl();
    this.getData(url);
  },

  data() {
    return {
      data: [],
      selectedDate: null,
      titleFormater: undefined,
      dateFormatter: null,
      displayEvent: false,
      event: null,
      locale: undefined,
      calendarView: 'day-resource',
      calendarResources: [
        { label: 'John' },
        { label: 'Mary' },
        { label: 'Susan' },
        { label: 'Olivia' },
        { label: 'Board Room' },
        { label: 'Room-1' },
        { label: 'Room-2' },
      ],
      viewOptions: [
        { label: 'Día', value: 'day' },
        { label: 'Semana', value: 'week' },
        { label: 'Mes', value: 'month' },
        { label: 'Month Interval', value: 'month-interval' },
        { label: 'Custom Interval', value: 'custom-interval' },
        { label: 'Scheduler', value: 'scheduler' },
        { label: 'Week Scheduler', value: 'week-scheduler' },
        { label: 'Month Scheduler', value: 'month-scheduler' },
        { label: 'Agenda', value: 'agenda' },
        { label: 'Week Agenda', value: 'week-agenda' },
        { label: 'Month Agenda', value: 'month-agenda' },
        { label: 'Custom Agenda', value: 'custom-agenda' },
        { label: 'Recursos', value: 'day-resource' },
      ],      
    };
  },  
};
</script>
<style>

.calendar-container {
  position: relative;
}

.my-event {
  width: 100%;
  position: absolute;
  font-size: 12px
}

.full-width {
  left: 0;
  width: 100%;
}

.left-side {
  left: 0;
  width: 49.75%;
}

.right-side {
  left: 50.25%;
  width: 49.75%;
}
</style>
