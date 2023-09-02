/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"ProjectTime/ZProjectTime/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"ProjectTime/ZProjectTime/test/integration/pages/Worklist",
	"ProjectTime/ZProjectTime/test/integration/pages/Object",
	"ProjectTime/ZProjectTime/test/integration/pages/NotFound",
	"ProjectTime/ZProjectTime/test/integration/pages/Browser",
	"ProjectTime/ZProjectTime/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "ProjectTime.ZProjectTime.view."
	});

	sap.ui.require([
		"ProjectTime/ZProjectTime/test/integration/WorklistJourney",
		"ProjectTime/ZProjectTime/test/integration/ObjectJourney",
		"ProjectTime/ZProjectTime/test/integration/NavigationJourney",
		"ProjectTime/ZProjectTime/test/integration/NotFoundJourney",
		"ProjectTime/ZProjectTime/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});