sap.ui.define([
		"ProjectTime/ZProjectTime/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ProjectTime.ZProjectTime.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);