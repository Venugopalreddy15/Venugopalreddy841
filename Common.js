sap.ui.define(["sap/ui/test/Opa5"],function(e){"use strict";function t(e,t){var r=jQuery.sap.getResourcePath("ProjectTime/ZProjectTime/app",".html");t=t?"?"+t:"";if(e){e="#ProjectTime-display&/"+(e.indexOf("/")===0?e.substring(1):e)}else{e="#ProjectTime-display"}return r+t+e}return e.extend("ProjectTime.ZProjectTime.test.integration.pages.Common",{iStartMyApp:function(e){var r;e=e||{};var i=e.delay||50;r="serverDelay="+i;this.iStartMyAppInAFrame(t(e.hash,r))},createAWaitForAnEntitySet:function(e){return{success:function(){var t=false,r;this.getMockServer().then(function(i){r=i.getEntitySetData(e.entitySet);t=true});return this.waitFor({check:function(){return t},success:function(){e.success.call(this,r)},errorMessage:"was not able to retireve the entity set "+e.entitySet})}}},getMockServer:function(){return new Promise(function(t){e.getWindow().sap.ui.require(["ProjectTime/ZProjectTime/localService/mockserver"],function(e){t(e.getMockServer())})})},iStartMyAppOnADesktopToTestErrorHandler:function(e){this.iStartMyAppInAFrame(t("",e))}})});