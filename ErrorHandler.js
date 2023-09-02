sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox"],function(e,s){"use strict";return e.extend("ProjectTime.ZProjectTime.controller.ErrorHandler",{constructor:function(e){this._oResourceBundle=e.getModel("i18n").getResourceBundle();this._oComponent=e;this._oModel=e.getModel();this._bMessageOpen=false;this._sErrorText=this._oResourceBundle.getText("errorText");this._oModel.attachMetadataFailed(function(e){var s=e.getParameters();this._showServiceError(s.response)},this);this._oModel.attachRequestFailed(function(e){var s=e.getParameters();if(s.response.statusCode!=="404"||s.response.statusCode===404&&s.response.responseText.indexOf("Cannot POST")===0){this._showServiceError(s.response)}},this)},_showServiceError:function(e){if(this._bMessageOpen){return}this._bMessageOpen=true;var r="";if(e.responseText){var t=JSON.parse(e.responseText).error.innererror.errordetails;for(var o=0;o<t.length-1;o++){r=r+t[o].message+"\r\n"}}else{r=e}s.error(r,{id:"serviceErrorMessageBox",styleClass:this._oComponent.getContentDensityClass(),actions:[s.Action.CLOSE],onClose:function(){this._bMessageOpen=false}.bind(this)})}})});