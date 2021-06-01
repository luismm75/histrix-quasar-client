import { version } from '../package.json'

import HistrixApi from './services/histrixApi.js';
import ExportForm from './components/ExportForm.vue';
import HistrixApp from './components/HistrixApp.vue';
import HistrixCalendar from './components/HistrixCalendar.vue';
import HistrixCell from './components/HistrixCell.vue';
import HistrixChart from './components/HistrixChart.vue';
import HistrixDashboard from './components/HistrixDashboard.vue';
import HistrixField from './components/HistrixField.vue';
import HistrixFilters from './components/HistrixFilters.vue';
import HistrixForm from './components/HistrixForm.vue';
import HistrixList from './components/HistrixList.vue';
import HistrixTable from './components/HistrixTable.vue';
import HistrixTree from './components/HistrixTree.vue';
import LoginForm from './components/LoginForm.vue';
import HistrixPasswordChange from './components/HistrixPasswordChange.vue';
import DatabaseSelector from './components/widgets/DatabaseSelector.vue';
import HistrixExpansionMenu from './components/widgets/HistrixExpansionMenu.vue';
import HistrixLog from './components/widgets/HistrixLog.vue';
import HistrixMenu from './components/widgets/HistrixMenu.vue';
import HistrixNews from './components/widgets/HistrixNews.vue';
import HistrixUsers from './components/widgets/HistrixUsers.vue';
import notificationMenu from './components/widgets/notificationMenu.vue';
import profileMenu from './components/widgets/profileMenu.vue';
import profileMenuItems from './components/widgets/profileMenuItems.vue';



export {
  version,
  HistrixApi,
  ExportForm,
  HistrixApp,
  HistrixCalendar,
  HistrixCell,
  HistrixChart,
  HistrixDashboard,
  HistrixField,
  HistrixFilters,
  HistrixForm,
  HistrixList,
  HistrixTable,
  HistrixTree,
  LoginForm,
  HistrixPasswordChange,
  DatabaseSelector,
  HistrixExpansionMenu,
  HistrixLog,
  HistrixMenu,
  HistrixNews,
  HistrixUsers,
  notificationMenu,
  profileMenu,
  profileMenuItems,
}

export default {
  version,
  ExportForm,
  HistrixApp,
  HistrixCalendar,
  HistrixCell,
  HistrixChart,
  HistrixDashboard,
  HistrixField,
  HistrixFilters,
  HistrixForm,
  HistrixList,
  HistrixTable,
  HistrixTree,
  LoginForm,
  HistrixPasswordChange,
  DatabaseSelector,
  HistrixExpansionMenu,
  HistrixLog,
  HistrixMenu,
  HistrixNews,
  HistrixUsers,
  notificationMenu,
  profileMenu,
  profileMenuItems,  
  install (Vue) {
    Vue.component(ExportForm.name, ExportForm);
    Vue.component(HistrixApp.name, HistrixApp);
    Vue.component(HistrixCalendar.name, HistrixCalendar);
    Vue.component(HistrixCell.name, HistrixCell);
    Vue.component(HistrixChart.name, HistrixChart);
    Vue.component(HistrixDashboard.name, HistrixDashboard);
    Vue.component(HistrixField.name, HistrixField);
    Vue.component(HistrixFilters.name, HistrixFilters);
    Vue.component(HistrixForm.name, HistrixForm);
    Vue.component(HistrixList.name, HistrixList);
    Vue.component(HistrixTable.name, HistrixTable);
    Vue.component(HistrixTree.name, HistrixTree);
    Vue.component(HistrixPasswordChange.name, HistrixPasswordChange);
    Vue.component(LoginForm.name, LoginForm);
    Vue.component(DatabaseSelector.name, DatabaseSelector);
    Vue.component(HistrixExpansionMenu.name, HistrixExpansionMenu);
    Vue.component(HistrixLog.name, HistrixLog);
    Vue.component(HistrixMenu.name, HistrixMenu);
    Vue.component(HistrixNews.name, HistrixNews);
    Vue.component(HistrixUsers.name, HistrixUsers);
    Vue.component(notificationMenu.name, notificationMenu);
    Vue.component(profileMenu.name, profileMenu);
    Vue.component(profileMenuItems.name, profileMenuItems);
  }
}
