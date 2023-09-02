sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ProjectTime.ZProjectTime.controller.App", {

		onInit : function () {
			var oViewModel,
				fnSetAppNotBusy,
				
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
					var path = $.sap.getModulePath("ProjectTime.ZProjectTime", "/Images/ds8.png");
				var oImageData={
					"image":path
				};
					var oImageModel = new JSONModel(oImageData);
						this.setModel(oImageModel, "oImageModel");
			oViewModel = new JSONModel({
				busy : true,
				delay : 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
				then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});