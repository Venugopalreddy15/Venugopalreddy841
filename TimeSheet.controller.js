sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ProjectTime.ZProjectTime.controller.TimeSheet", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var self = this;
			var oView = self.getView();
			//CR:376  it loads the image
			var path = $.sap.getModulePath("ProjectTime.ZProjectTime", "/Images/download.jpg");
			//CR:376  it loads the intial data for Time sheet.
			var oTimeheetData = {
				"Notes": "",
				"VacationNotes": "",
				"VacationNotesVisible": false,
				"Image": path,
				"tableColumns": [],
				"StartDateMonth": "",
				"EndDateMonth": "",
				"PreviousButton": true,
				"NextButton": true,
				"user": "",
				"usereditable": false,
				"NoOfWeeksInYear": 52,
				"firstTimeUser": {
					"Monday": true,
					"Saturday": true,
					"Sunday": true
				},

				"tableItems": [{
					"ProjectCode": "GOV-445;Nisco SC",
					"ResourceType": "ResourceType1",
					"Monday": '0.00',
					"Tuesday": '0.00',
					"Wedesday": '0.00',
					"Tursday": '0.00',
					"Friday": '0.00',
					"Saturday": '0.00',
					"Sunday": '0.00',
					"TotalHours": '0.00',
					"Day0valueStateText": "",
					"Day0valueState": "None",
					"Day1valueStateText": "",
					"Day1valueState": "None",
					"Day2valueStateText": "",
					"Day2valueState": "None",
					"Day3valueStateText": "",
					"Day3valueState": "None",
					"Day4valueStateText": "",
					"Day4valueState": "None",
					"Day5valueStateText": "",
					"Day5valueState": "None",
					"Day6valueStateText": "",
					"Day6valueState": "None",
					"Day7valueStateText": "",
					"Day7valueState": "None",
					"Notes": "Notes1"
				}]
			};
			//CR:376   Model is used for get current week Data from Timesheet App
			var oTimeshetModel = new JSONModel(oTimeheetData);
			oView.setModel(oTimeshetModel, "oTimeshetModel");
			//CR:376   Model is used for get User Data from Timesheet App
			var oUserModel = new JSONModel();
			oView.setModel(oUserModel, "oUserModel");
			//CR:376   Model is used for get WBS Filter Data from Timesheet App
			var oNewProjectModel = new JSONModel(oTimeheetData);
			oView.setModel(oNewProjectModel, "oNewProjectModel");
			var oFilterData = {
				"WBS": "",
				"Description": "",
				"ProjectDefination": ""
			};
			var oFileterModel = new JSONModel(oFilterData);
			oView.setModel(oFileterModel, "oFileterModel");
			//CR:376   Model is used for get Notes Model Data from Timesheet App
			var oNotesModel = new JSONModel();
			oView.setModel(oNotesModel, "oNotesModel");
			// var startofweek = self.startOfWeek(new Date());
			// oTimeshetModel.getData().StartDateMonth = startofweek.getDate() + " " + this.MonthAsString(startofweek.getMonth());

			// var startDate = startofweek;
			// var aryDates = this.GetDates(startDate, 6);
			// self.formJson(aryDates);
			// oTimeshetModel.updateBindings(true);

			// var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			// oVizFrame.setVizProperties({
			// 	legend: {
			// 		title: {
			// 			visible: false
			// 		}
			// 	},
			// 	title: {
			// 		visible: false
			// 	}
			// });
			// var oChartData = {
			// 	"items": [{
			// 		"Name": "TotalHours",
			// 		"Hours": 40

			// 	},{
			// 		"Name": "ActualHours",
			// 		"Hours": 40

			// 	}]
			//	};
			// var oChartModel = new JSONModel(oChartData);
			// oView.setModel(oChartModel, "oChartModel");
			// oVizFrame.setModel(oChartModel, "oChartModel");
			//   var oPopOver = this.getView().byId("idPopOver");
			//         oPopOver.connect(oVizFrame.getVizUid());
			var sFrstModay;
			if (this.getOwnerComponent().user === "X") {
				oTimeshetModel.getData()["WeekNumber"] = this.getOwnerComponent().week;
				oTimeshetModel.getData()["Year"] = this.getOwnerComponent().year;
				sFrstModay = this.getDateOfISOWeek(this.getOwnerComponent().week, this.getOwnerComponent().year);
				oTimeshetModel.getData()["user"] = "X";
			} else {
				var result = this.getWeekNumber(new Date());
				oTimeshetModel.getData()["WeekNumber"] = result[1];
				oTimeshetModel.getData()["Year"] = result[0];

				sFrstModay = this.getDateOfISOWeek(result[1], result[0]);
			}
			oTimeshetModel.updateBindings(true);
			this.getNextSevenDates(sFrstModay);
			this.UserDetails();
			this.Timer();
			this._GetData();
			this._GetNotes();
			this._setTitle();
			this.ValidateFrstUser();
			//start changes by ajay kumar 14th dec
			this.getWeeksinYear(oTimeshetModel.getProperty("/Year"));
			//End changes by ajay kumar 14th dec
			//{i18n>ProjectTime} {oTimeshetModel>/StartDateMonth}-{oTimeshetModel>/EndDateMonth} ({i18n>Week} {oTimeshetModel>/WeekNumber})
			$("input[type='number']").on("click", function () {
				$(this).select();
			});
		},
		//CR#575 - TR-No-GWDK900422 Start -changed by ajay kumar Goranti 14th dec -2020
		//This method is used to calculate number of weeks in a month based on the leap year and year starts on a Thursday.
		getWeeksinYear: function (startDateYear) {
			var that = this;
			var oView = that.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			// var oStartDate = oTimeshetModel.getProperty("/StartDateofTitle");
			// var startDateYear = oStartDate.getFullYear();
			var d, isLeap;
			d = new Date(startDateYear, 0, 1); //we will get start date of year
			isLeap = new Date(startDateYear, 1, 29).getMonth() === 1; //it will check the leap year or not
			// if year starts on a Thursday or is a leap year that starts on a Wednesday has 53 weeks otherwise it has 52 weeks
			if (d.getDay() === 4 || isLeap && d.getDay() === 3) {
				oTimeshetModel.setProperty("/NoOfWeeksInYear", 53);
			} else {
				oTimeshetModel.setProperty("/NoOfWeeksInYear", 52);
			}
		},
		//CR#575 - TR-No-GWDK900422 End -changed by ajay kumar Goranti 14th dec -2020

		onUpdateFinished: function (oEvent) {
			// var oEvent
			var me = this;
			var oTable = oEvent.getSource();
			var oCellItems;
			oTable.addEventDelegate({
				onAfterRendering: function (src) {
					var oItems = src.srcControl.getItems();
					for (var i = 0; i < oItems.length; i++) {
						oCellItems = oItems[i].getCells()[1].getItems();
						for (var j = 0; j < oCellItems.length; j++) {
							// function incerreturnkey(evet) {
							// 	var currentBoxNumber = 1;
							// 	var event = (evet) ? evet : ((evet) ? evet : null);
							// 	if (event.keyCode == 13) {
							// 		evet.preventDefault();
							// 		var $this = $(evet.target);
							// 		var index = parseFloat($this.attr('data-index'));
							// 		$('[data-index="' + (index + 1).toString() + '"]').focus();
							// 	}
							// }
							// oCellItems[j].onkeydown = incerreturnkey;
							oCellItems[j].addEventDelegate({
								onfocusin: function () {
									$("input[type='number']").on("click", function () {
										$(this).select();
									});
								}

							});
						}

					}

				}
			}, this);
		},

		//CR:376   This method validate the when new user joins and it will disable the privous Dates upon date of joining.
		ValidateFrstUser: function () {
			var me = this;
			var startdate, starttime, string;
			var oView = me.getView();
			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			var tableColumns = oTimeshetModel.getProperty("/tableColumns");
			var tableItems = oTimeshetModel.getProperty("/tableItems");
			var cureentWeekNumber = oTimeshetModel.getProperty("/WeekNumber");
			var currentYear = oTimeshetModel.getProperty("/Year");
			// "firstTimeUser": {
			// 	"Monday": true,
			// 	"Tuesday": true,
			// 	"Wednesday": true,
			// 	"Thursday": true,
			// 	"Friday": true,
			// 	"Saturday": true,
			// 	"Sunday": true
			// },

			oTimeshetModel.setProperty("/firstTimeUser/Monday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Tuesday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Wednesday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Thursday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Friday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Saturday", false);
			oTimeshetModel.setProperty("/firstTimeUser/Sunday", false);

			if (tableItems.length > 0) {
				startdate = tableItems[0].StartDate;
				string = startdate.substring(0, 4) + "/" + startdate.substring(4, 6) + "/" + startdate.substring(6, 8);
				startdate = new Date(string);
				//	startdate = new Date("2020/01/24");
				starttime = startdate.getTime();
				var result = this.getWeekNumber(startdate);
				//	var currenttime = new Date().getTime();
				//		if (cureentWeekNumber === result[1] && currentYear === result[0]) {

				if (tableColumns[2].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Monday", true);
				}
				if (tableColumns[3].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Tuesday", true);
				}
				if (tableColumns[4].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Wednesday", true);
				}
				if (tableColumns[5].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Thursday", true);
				}
				if (tableColumns[6].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Friday", true);
				}
				if (tableColumns[7].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Saturday", true);
				}
				if (tableColumns[8].Date.getTime() < starttime) {
					oTimeshetModel.setProperty("/firstTimeUser/Sunday", true);
				}

				//	}

			}

		},
		//CR:376   This method set the Title of the Project Time Sheet.it will disply the title based on device.
		_setTitle: function () {
			var me = this;
			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			if (sap.ui.Device.system.phone) {
				this.getView().getContent()[0].setTitle("Time Sheet ( Week #" + oTimeshetModel.getProperty("/WeekNumber") + " )");
			} else {
				this.getView().getContent()[0].setTitle("Time Sheet for " + oTimeshetModel.getProperty("/StartDateMonth") + "-" + oTimeshetModel.getProperty(
					"/EndDateMonth") + " - " + "(Week #" + oTimeshetModel.getProperty("/WeekNumber") + ")");
			}
		},
		//CR:376   This method will trigger when WBS Search Press on Creating new project. it filter out based on WBS,Description,Project Defination.
		// it gives the result of WBS Search.
		onGoSearchPress: function () {
			var me = this;
			var oView = me.getView();
			var oFileterModel = oView.getModel("oFileterModel");
			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			var weekNumber = oTimeshetModel.getProperty("/WeekNumber");
			var year = oTimeshetModel.getProperty("/Year");
			var WBS = oFileterModel.getProperty("/WBS");
			var Description = oFileterModel.getProperty("/Description");
			var ProjectDefination = oFileterModel.getProperty("/ProjectDefination");
			var aFilters = [];
			var id;
			aFilters.push(new sap.ui.model.Filter("ProjectCode", sap.ui.model.FilterOperator.EQ, WBS));
			aFilters.push(new sap.ui.model.Filter("Txt", sap.ui.model.FilterOperator.EQ, Description));
			aFilters.push(new sap.ui.model.Filter("Project_Def", sap.ui.model.FilterOperator.EQ, ProjectDefination));
			aFilters.push(new sap.ui.model.Filter("WeekNo", sap.ui.model.FilterOperator.EQ, weekNumber));
			aFilters.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, year));
			if (sap.ui.Device.system.phone) {
				id = "MidWBSTable";
			} else {
				id = "idWBSTable";
			}
			var oTable = sap.ui.getCore().byId(id);
			// oTable.unbindItems();
			// var oTemplate = new sap.m.ColumnListItem({
			// 	cells: [
			// 		new sap.m.Text({
			// 			text: "{ReportModel>ProjectCode}"

			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Txt}"

			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Level}"
			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Project_Def}"
			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>T_Area}"
			// 		})
			// 	]
			// });
			//	var path = "ReportModel>/Sch_ProjectCodeSet(ProjectCode='" + WBS + "',Txt='" + Description + "',Project_Def='" + ProjectDefination +"')";
			// var path = "ReportModel>/Sch_ProjectCodeSet(ProjectCode='" + WBS + "')";
			//	oTable.bindItems(path, oTemplate);
			oTable.getBinding("items").filter(aFilters);

		},
		//CR:376   This method triggers when refresh button press on WBS Dialog.it will refresh the WBS search elements .
		onRefreshSearchPress: function () {
			var me = this;
			var oView = me.getView();
			var aFilters = [];
			var oTable = sap.ui.getCore().byId("idWBSTable");
			oTable.getBinding("items").filter(aFilters);
		},

		// Added on 09/15/2020
		// CR#376 this method is used to show error message while pressing save or submit when we enter invalid WBs

		onsave_submitvalidation: function () {
			var me = this;
			var oView = me.getView();
			var promise = jQuery.Deferred();
			var oTimeshetModel = oView.getModel("oTimeshetModel");

			var Obj = {
				"WeekNo": oTimeshetModel.getProperty("/WeekNumber").toLocaleString(),
				"User": ""
			};
			var oDataModel = this.getOwnerComponent().getModel();
			oDataModel.create('/WbsValidationSet', Obj, {
				success: function (data) {
					promise.resolve("success");

				},
				error: function (oError) {
					promise.resolve("error");

				}
			});
			return promise;
		},

		//CR:376   This method triggers when Submit button press.this method will save the Total Time sheet Data. after submitting it will disable the all input fields.
		onSubmitPress: function (oEvent) {
			var me = this;
			var oView = me.getView();
			//	me.oEvent=oEvent;

			me.oCustomDataValue = oEvent.getSource().getCustomData()[0].getValue();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var oTimessheetData = oTimeshetModel.getData();
			if (parseFloat(oTimessheetData.tableColumns[9].Total) < 37.5) {
				sap.m.MessageBox.show(
					"Total hours submitted for this week are less than 37.5 hours. Do you still want to proceed?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Warning",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === "YES") {
								me.onSavePress(oEvent, me.oCustomDataValue);
							}

						}
					}
				);
			} else {
				me.onSavePress(oEvent, me.oCustomDataValue);
			}

		},
		validate: function () {
			var me = this;
			var oView = me.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var oTimessheetData = oTimeshetModel.getData();
			var tableItems = oTimessheetData.tableItems;
			var error = false;
			for (var j = 2; j <= 8; j++) {
				if (oTimessheetData.tableColumns[j].Total > 24) {
					error = true;
					return error;
				}
			}
			for (var k = 0; k < tableItems.length; k++) {
				if (tableItems[k].Day0valueState === "Error" || tableItems[k].Day1valueState === "Error" || tableItems[k].Day2valueState ===
					"Error" || tableItems[k].Day3valueState === "Error" || tableItems[k].Day4valueState === "Error" || tableItems[k].Day5valueState ===
					"Error" || tableItems[k].Day6valueState === "Error") {
					error = true;
					return error;
				}
			}
		},
		//CR:376   This method triggers when Save button press.this method will save the Total Time sheet Data. 
		onSavePress: function (oEvent, oCustomDataValue) {
			var me = this;
			var oView = me.getView();

			me.RowColumnCal();
			if (!oCustomDataValue) {
				oCustomDataValue = oEvent.getSource().getCustomData()[0].getValue();
			}
			var oObj, lock;
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var oTimessheetData = oTimeshetModel.getData();
			var oDataModel = this.getOwnerComponent().getModel();
			oDataModel.setUseBatch(true);
			oDataModel.setDeferredGroups(["UpdateTimeSheet"]);
			if (oCustomDataValue === "Submit") {
				lock = "X";
			} else {
				lock = "";
			}

			if (oCustomDataValue === "Save") {
				this.Saved = "X";
			} else {
				this.Saved = "";
			}
			//CR#376 Start - validate WBS Elements lines of code added by Ajay kumar Goranti 15th sep 2020
			var validateValue = me.onsave_submitvalidation();
			validateValue.then(function (oResponse) {
				if (oResponse != "error") {
					//End - validate WBS Elements lines of code added by Ajay kumar Goranti 15th sep 2020
					if (!me.validate()) {
						for (var i = 0; i < oTimessheetData.tableItems.length; i++) {

							oObj = {
								"Projectcode": oTimessheetData.tableItems[i].Projectcode,
								"ResourceType": oTimessheetData.tableItems[i].ResourceType,
								"WeekNo": oTimessheetData.tableItems[i].WeekNo + "",
								"User": oTimessheetData.tableItems[i].User,
								"Year": oTimessheetData.tableItems[i].Year + "",
								"ProjectDesc": oTimessheetData.tableItems[i].ProjectDesc,
								"TypeDesc": oTimessheetData.tableItems[i].TypeDesc,
								"Day01": oTimessheetData.tableItems[i].Day01,
								"Day02": oTimessheetData.tableItems[i].Day02,
								"Day03": oTimessheetData.tableItems[i].Day03,
								"Day04": oTimessheetData.tableItems[i].Day04,
								"Day05": oTimessheetData.tableItems[i].Day05,
								"Day06": oTimessheetData.tableItems[i].Day06,
								"Day07": oTimessheetData.tableItems[i].Day07,
								"Note": oTimessheetData.tableItems[i].Note,
								"StartDate": oTimessheetData.tableItems[i].StartDate,
								"WBSType": oTimessheetData.tableItems[i].WBSType,
								"Lock": lock
							};
							if (oTimessheetData.tableItems[i].WBSType === "V" || oTimessheetData.tableItems[i].WBSType === "C") {
								oObj.Note = oTimessheetData.VacationNotes;
							}

							var Projectcode = encodeURIComponent(oTimessheetData.tableItems[i].Projectcode);

							// method: "PUT  {groupId:"UpdateTimeSheet"}
							var sPath = "/TimeSheetSet(Projectcode='" + Projectcode + "',ResourceType='" + oTimessheetData.tableItems[
									i].ResourceType + "',WeekNo='" + oTimessheetData.tableItems[i].WeekNo + "',User='',Year='" + oTimessheetData.tableItems[i].Year +
								"')";
							oDataModel.update(sPath, oObj, {
								merge: false,
								groupId: "UpdateTimeSheet"
							});
						}

						var oNotesModel = oView.getModel("oNotesModel");

						var NotesObj = {
							"User": "",
							"WeekNo": oNotesModel.getProperty("/WeekNo"),
							"Year": oNotesModel.getProperty("/Year"),
							"Day01": oNotesModel.getProperty("/Day01"),
							"Day02": oNotesModel.getProperty("/Day02"),
							"Day03": oNotesModel.getProperty("/Day03"),
							"Day04": oNotesModel.getProperty("/Day04"),
							"Day05": oNotesModel.getProperty("/Day05"),
							"Day06": oNotesModel.getProperty("/Day06"),
							"Day07": oNotesModel.getProperty("/Day07"),
							"Lock": lock
						};
						var sNotesPath = "/NotesSet(User='',WeekNo='" + oTimessheetData.WeekNumber + "',Year='" + oTimessheetData.Year + "')";
						// filters: aFilters,
						oDataModel.update(sNotesPath, NotesObj, {
							merge: false,
							groupId: "UpdateTimeSheet"
						});
						sap.ui.core.BusyIndicator.show();
						oDataModel.submitChanges({
							groupId: "UpdateTimeSheet",
							success: function (response) {
								me._GetData();
								me.Saved = "";
								oTimeshetModel.setProperty("/usereditable", false);
								if (oCustomDataValue === "Submit") {
									sap.m.MessageToast.show("Timesheet Submitted Successfully");
								} else if (oCustomDataValue === "Save") {
									sap.m.MessageToast.show("Timesheet Saved Successfully");
								}
								sap.ui.core.BusyIndicator.hide();

							},
							error: function (error) {
								sap.ui.core.BusyIndicator.hide();
							}
						});
					} else {
						sap.m.MessageToast.show("Please Correct the Time highlight in red Color ");
					}
					//Start - validate WBS Elements lines of code added by Ajay kumar Goranti 15th sep 2020
				}
			});
			//End - validate WBS Elements lines of code added by Ajay kumar Goranti 15th sep 2020
		},
		handleBatchSuccess: function (batchResponse, Results) {},

		//CR:376   This method loads the Notes Details from service. 
		_GetNotes: function () {
			var me = this;
			var oView = me.getView();
			var results;
			var oTimeshetModel = oView.getModel("oTimeshetModel");

			var oTimessheetData = oTimeshetModel.getData();
			var oNotesModel = oView.getModel("oNotesModel");
			var oDataModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("WeekNo", sap.ui.model.FilterOperator.EQ, oTimessheetData.WeekNumber));
			aFilters.push(new sap.ui.model.Filter("User", sap.ui.model.FilterOperator.EQ, ''));
			aFilters.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, oTimessheetData.Year));
			var sPath = "/NotesSet(User='',WeekNo='" + oTimessheetData.WeekNumber + "',Year='" + oTimessheetData.Year + "')";
			// filters: aFilters,
			sap.ui.core.BusyIndicator.show();
			oDataModel.read(sPath, {
				success: function (oData) {
					oNotesModel.setData(oData);
					oNotesModel.updateBindings(true);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		//CR:376   This method loads the Timesheet  Details from Time sheet service. 
		_GetData: function () {
			var me = this;
			var oView = me.getView();
			var results;
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			oTimeshetModel.setProperty("/tableItems", []);
			var oTable = oView.byId("dtimesheetTable");
			var oTableModel = oTable.getModel("oTimeshetModel");
			var oTimessheetData = oTimeshetModel.getData();
			var oDataModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			var obj = {
				"TotalHours": '0.00',
				"Day0valueStateText": "",
				"Day0valueState": "None",
				"Day1valueStateText": "",
				"Day1valueState": "None",
				"Day2valueStateText": "",
				"Day2valueState": "None",
				"Day3valueStateText": "",
				"Day3valueState": "None",
				"Day4valueStateText": "",
				"Day4valueState": "None",
				"Day5valueStateText": "",
				"Day5valueState": "None",
				"Day6valueStateText": "",
				"Day6valueState": "None",
				"Day7valueStateText": "",
				"Day7valueState": "None",
			};
			aFilters.push(new sap.ui.model.Filter("WeekNo", sap.ui.model.FilterOperator.EQ, oTimessheetData.WeekNumber));
			aFilters.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, oTimessheetData.Year));
			sap.ui.core.BusyIndicator.show(1000);
			oDataModel.read("/TimeSheetSet", {
				filters: aFilters,
				success: function (oData) {
					oTimeshetModel.setProperty("/tableItems", []);
					results = oData.results;
					for (var j = 0; j < results.length; j++) {
						if (results[j].WBSType === "V" || results[j].WBSType === "C") {
							oTimessheetData.VacationNotes = results[j].Note;
							oTimessheetData.VacationNotesVisible = true;
						}

						var fullObj = $.extend({}, obj, results[j]);
						//var fullObj = Object.assign({}, obj, results[j]);
						oTimessheetData.tableItems.push(fullObj);
					}
					oTableModel.refresh(false);
					// if(oTimessheetData.tableItem.length>results.length){
					// 		oTimessheetData.tableItems=[];
					// }
					oTimeshetModel.updateBindings(true);
					me.RowColumnCal();
					me.ValidateFrstUser();
					oTableModel.refresh(true);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		//CR:376   This method loads the Privous and Next week Timesheet  Details from Time sheet service based on Week num and year, flag. 
		_getPreviousNextData: function (weeknum, year, flag) {
			var me = this;
			var oView = me.getView();
			var results;
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			oTimeshetModel.setProperty("/tableItems", []);
			var oTimessheetData = oTimeshetModel.getData();
			var oDataModel = this.getOwnerComponent().getModel();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("WeekNo", sap.ui.model.FilterOperator.EQ, weeknum));
			aFilters.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, year));
			sap.ui.core.BusyIndicator.show();
			oDataModel.read("/TimeSheetSet", {
				filters: aFilters,
				success: function (oData) {
					results = oData.results;
					if (results.length === 0 && flag === "P") {
						oTimeshetModel.setProperty("/PreviousButton", false);
						oTimeshetModel.setProperty("/NextButton", true);
					} else {
						oTimeshetModel.setProperty("/PreviousButton", true);
					}
					if (results.length === 0 && flag === "N") {
						oTimeshetModel.setProperty("/NextButton", false);
						oTimeshetModel.setProperty("/PreviousButton", true);
					} else {
						oTimeshetModel.setProperty("/NextButton", true);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		//CR:376   This method calculates  the 10min timeout and throws error.
		Timer: function () {
			var fiveMinutesLater = new Date();
			var scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
			window.IDLE_TIMEOUT = scs; //seconds
			this._idleSecondsTimer = null;
			this._idleSecondsCounter = 0;
			// var fiveMinutesLater = new Date();

			document.onclick = function () {
				//	this._idleSecondsCounter = 0;
				fiveMinutesLater = new Date();
				scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
				window.IDLE_TIMEOUT = scs;
			};

			document.onmousemove = function () {
				//	this._idleSecondsCounter = 0;
				fiveMinutesLater = new Date();
				scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
				window.IDLE_TIMEOUT = scs;
			};

			document.onkeypress = function () {
				//		this._idleSecondsCounter = 0;
				fiveMinutesLater = new Date();
				scs = fiveMinutesLater.setMinutes(fiveMinutesLater.getMinutes() + 5);
				window.IDLE_TIMEOUT = scs;
			};
			window.X = window.setInterval(function () {
				var now = new Date().getTime();
				var cTime = window.IDLE_TIMEOUT - now;
				if (cTime < 0) {
					window.clearInterval(window.X);
					// sap.ui.getCore()byId("timer").setValue("OTP Expires in 0:0 Minutes");
					sap.m.MessageBox.information(
						"Your session expired. please click Ok to restart", {

							styleClass: "Cancelbuttons",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function (oAction) {
								window.location.reload();
							}
						});

				}
			});

		},
		//CR:376   This method triggers help icon button press. it opens the help dialog. 
		onHelpIconPress: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oHelpPopover) {
				this._oHelpPopover = sap.ui.xmlfragment(
					"ProjectTime.ZProjectTime.fragment.Help",
					this
				);
				this.getView().addDependent(this._oHelpPopover);
			}
			this._oHelpPopover.openBy(oButton);
			// create popover
			// if (!this._oHelpPopover) {
			// 	new sap.ui.core.Fragment.load({
			// 		name: "ProjectTime.ZProjectTime.fragment.Help",
			// 		controller: this
			// 	}).then(function (pPopover) {
			// 		this._oHelpPopover = pPopover;
			// 		this.getView().addDependent(this._oHelpPopover);
			// 		this._oHelpPopover.openBy(oButton);
			// 	}.bind(this));
			// } else {
			// 	this._oHelpPopover.openBy(oButton);
			// }
		},
		//CR:376   This method lodas the User details and stores the data in UserDetailModel Model. 
		UserDetails: function () {
			var me = this;
			var oView = me.getView();
			var UserDetailModel = me.getOwnerComponent().getModel("UserDetailModel");
			var oUserModel = oView.getModel("oUserModel");
			var path = "/UserDetails('')";
			sap.ui.core.BusyIndicator.show();
			UserDetailModel.read(path, {
				success: function (oData) {
					oUserModel.setData(oData);
					oUserModel.updateBindings(false);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (error) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		//CR:376   This method genarates the avathar image for our Name. 
		generateAvatar: function (name) {
			if (name) {
				var initials = name.split(' ').map(function (str) {
					return str ? str[0].toUpperCase() : "";
				}).join('');
				var canvas = document.createElement('canvas');
				var radius = 30;
				var margin = 5;
				canvas.width = radius * 2 + margin * 2;
				canvas.height = radius * 2 + margin * 2;

				// Get the drawing context
				var ctx = canvas.getContext('2d');
				ctx.beginPath();
				ctx.arc(radius + margin, radius + margin, radius, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.fillStyle = 'grey';
				ctx.fill();
				ctx.fillStyle = "white";
				ctx.font = "bold 30px Arial";
				ctx.textAlign = 'center';
				ctx.fillText(initials, radius + 5, radius * 4 / 3 + margin);
				return canvas.toDataURL();
			}
		},
		handlePreviousPress: function () {
			var self = this;
			var oView = self.getView();
			var date = new Date();
			var previousweek;
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var weeknum;
			var year = date.getFullYear();
			//CR#575 - TR-No-GWDK900422 start Changes by AJay kumar 14th dec 2020
			//This condition will trigger when we click on Pervioues button. based upon the condition we are showing dates and week
			var NoOfWeeksInYear = oTimeshetModel.getProperty("/NoOfWeeksInYear"); //Calculating number of weeks in  a year
			var ostartDate = oTimeshetModel.getProperty("/StartDateofTitle");
			var startDateYear = ostartDate.getFullYear(); // getting start date of every year
			if (oTimeshetModel.getData()["WeekNumber"] === 1) {
				// weeknum = NoOfWeeksInYear;
				// startDateYear = startDateYear - 1;

				//CR#575 - TR-No-GWDK900424 added by AJay kumar on 4th jan 2021
				//if start date is between > 28 and <= 31 we are not subtracting the year.
				if (!(ostartDate.getDate() > 28 && ostartDate.getDate() <= 31)) {
					startDateYear = startDateYear - 1;
				}
				this.getWeeksinYear(startDateYear);
				weeknum = oTimeshetModel.getProperty("/NoOfWeeksInYear");
				//CR#575 - TR-No-GWDK900424 End of changes by AJay kumar on 4th jan 2021

			} else {
				weeknum = oTimeshetModel.getData()["WeekNumber"] - 1;
			}
			//CR#575 - TR-No-GWDK900422 End Changes by AJay kumar 14th dec 2020
			var sFrstModay = self.getDateOfISOWeek(weeknum, startDateYear);
			self.getNextSevenDates(sFrstModay);
			oTimeshetModel.getData()["WeekNumber"] = weeknum;
			oTimeshetModel.updateBindings(false);
			self.UserDetails();
			self.Timer();
			self._GetData();
			//Start changes  by AJay kumar 16th dec
			if (oTimeshetModel.getData()["WeekNumber"] === 1) {
				//CR#575 - TR-No-GWDK900424 added by AJay kumar on 4th jan 2021
				//if week start date is  start date is not between > 28 and <= 31 we are not subtracting the year.
				if (!(ostartDate.getDate() > 28 && ostartDate.getDate() <= 31)) {
					startDateYear = startDateYear - 1;
				}
				this.getWeeksinYear(startDateYear);
				previousweek = oTimeshetModel.getProperty("/NoOfWeeksInYear");
				//CR#575 - TR-No-GWDK900424 End of changes by AJay kumar on 4th jan 2021

			} else {
				previousweek = weeknum - 1;
			}
			//End changes  by AJay kumar 16th dec
			self._getPreviousNextData(previousweek, startDateYear, "P");
			self.ValidateFrstUser();
			self._GetNotes();
			self._setTitle();
			oTimeshetModel.setProperty("/usereditable", false);
		},
		//CR:376   This method will trigger on Previous button press in Time sheet application.in this method we will set the prious week and based upon we will
		//call the all previous week details.
		onPreviousPress: function (oEvent) {
			//changed by skommuru
			var a = new sap.m.BusyDialog();
			a.open();
			a.setBusy(true);
			//end changes
			//	a.setBusyIndicatorDelay(5);
			var self = this;
			var oView = self.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var Locked;
			if (oTimeshetModel.getData().tableItems.length) {
				Locked = oTimeshetModel.getData().tableItems[0].Lock;
			} else {
				Locked = "";
			}
			if (oTimeshetModel.getProperty("/usereditable") && Locked != "X" && this.Saved != "X") {
				sap.m.MessageBox.show(
					"Do you want to save your changes?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {

							if (oAction === "YES") {
								self.onSavePress(oEvent, "Save");
								oTimeshetModel.setProperty("/usereditable", false);
								a.close();
							} else {
								self.handlePreviousPress();
								a.close();
							}
						}
					});
			} else {
				self.handlePreviousPress();
				a.close();
			}

		},
		//CR:376   This method will trigger on Next button press in Time sheet application.in this method we will set the prious week and based upon we will
		//call the all Next week details.
		handleNextPress: function () {
			var self = this;
			var oView = self.getView();
			var date = new Date();
			var nextweeknum;
			var year = date.getFullYear();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var oStartDate = oTimeshetModel.getProperty("/StartDateofTitle");
			var startDateYear = oStartDate.getFullYear();
			var weeknum;
			var result = this.getWeekNumber(oStartDate);
			oTimeshetModel.getData()["WeekNumber"] = result[1];
			//CR#575 - TR-No-GWDK900422 Start -Changes By Ajay 14th dec 2020
			//This condition will trigger when we click on Next button. based upon the condition we are showing dates and week
			var NoOfWeeksInYear = oTimeshetModel.getProperty("/NoOfWeeksInYear");
			if (oTimeshetModel.getData()["WeekNumber"] === NoOfWeeksInYear) {
				weeknum = 1;
				startDateYear = startDateYear + 1;
			} else {
				weeknum = oTimeshetModel.getData()["WeekNumber"] + 1;
				startDateYear = oTimeshetModel.getProperty("/EndDateofTitle").getFullYear();
			}
			//CR#575 - TR-No-GWDK900422 End -Changes By Ajay 14th dec 2020
			var sFrstModay = this.getDateOfISOWeek(weeknum, startDateYear);
			this.getNextSevenDates(sFrstModay);
			oTimeshetModel.getData()["WeekNumber"] = weeknum;
			oTimeshetModel.updateBindings(false);
			this.UserDetails();
			this.Timer();
			this._GetData();
			//CR#575 - TR-No-GWDK900422 Start -Changes By Ajay 14th dec 2020
			//This condition will trigger during last week of ever year 
			if (oTimeshetModel.getData()["WeekNumber"] === NoOfWeeksInYear) {
				startDateYear = startDateYear + 1;
				nextweeknum = 1;
			} else {
				nextweeknum = weeknum + 1;
			}
			//CR#575 - TR-No-GWDK900422 End -Changes By Ajay 14th dec 2020
			this._getPreviousNextData(nextweeknum, startDateYear, "N");
			this.ValidateFrstUser();
			this._GetNotes();
			this._setTitle();
			oTimeshetModel.setProperty("/usereditable", false);
		},
		//CR:376   This method will trigger on Previous button press in Time sheet application.in this method we will set the next week and based upon we will
		//call the all next week details.
		onNextPress: function (oEvent) {
			//changed by skommuru
			var a = new sap.m.BusyDialog();
			a.open();
			a.setBusyIndicatorDelay(0);
			// a.setBusy();
			//end changes
			var self = this;
			var oView = self.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var Locked;
			if (oTimeshetModel.getData().tableItems.length) {
				Locked = oTimeshetModel.getData().tableItems[0].Lock;
			} else {
				Locked = "";
			}
			if (oTimeshetModel.getProperty("/usereditable") && Locked != "X" && this.Saved != "X") {
				sap.m.MessageBox.show(
					"Do you want to save your changes?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === "YES") {
								self.onSavePress(oEvent, "Save");
								oTimeshetModel.setProperty("/usereditable", false);
								a.close();

							} else {
								self.handleNextPress();
								a.close();

							}
						}
					});
			} else {
				self.handleNextPress();
				a.close();

			}
		},
		//CR:376   This method  calculates the next seven dates

		getNextSevenDates: function (date) {
			var self = this;
			var oView = self.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var startofweek = self.startOfWeek(date);
			oTimeshetModel.getData().StartDateMonth = startofweek.getDate() + " " + this.MonthAsString(startofweek.getMonth());
			oTimeshetModel.getData().Year = startofweek.getFullYear();
			var startDate = startofweek;
			var aryDates = this.GetDates(startDate, 6);
			self.formJson(aryDates);
			oTimeshetModel.updateBindings(true);
		},
		//CR:376   This method  calculates monday date of a week.
		getDateOfISOWeek: function (w, y) {
			var simple = new Date(y, 0, 1 + (w - 1) * 7);
			var dow = simple.getDay();
			var ISOweekStart = simple;
			if (dow <= 4)
				ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
			else
				ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
			return ISOweekStart;
		},
		//CR:376   This method  calculates week number  baseed on date 
		getWeekNumber: function (d) {
			// Copy date so don't modify original
			d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
			// Set to nearest Thursday: current date + 4 - current day number
			// Make Sunday's day number 7
			d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
			// Get first day of year
			var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
			// Calculate full weeks to nearest Thursday
			var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
			// Return array of year and week number
			return [d.getUTCFullYear(), weekNo];
		},
		//CR:376   This method  formate the Table coulum data into json formate. 
		formJson: function (aryDates) {
			var self = this;
			var oTimeshetModel = self.getView().getModel("oTimeshetModel");
			var tableItems = oTimeshetModel.getData().tableColumns;
			tableItems = [];
			tableItems.push({
				"Column": "Project Code"

			}, {
				"Column": "Resource Type"

			});
			for (var i = 0; i < aryDates.length; i++) {
				tableItems.push({
					"Column": aryDates[i].DisplayDate,
					"Date": aryDates[i].Date
				});
			}
			tableItems.push({
				"Column": "Sub Totals"
			}, {
				"Column": "Project Notes"
			});
			oTimeshetModel.setProperty("/tableColumns", tableItems);
		},
		//CR:376   This method triggers when input data change. 
		onWeekDayChange: function (oEvent) {
			var me = this;
			var oView = me.getView();
			var value = oEvent.getSource().getValue();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			oTimeshetModel.setProperty("/usereditable", true);
			var src = oEvent.getSource();
			var sKey = src.getCustomData()[0].getKey();
			var sValue = src.getCustomData()[0].getValue();
			// src.unBindProperty("valueState");
			// 	src.unBindProperty("valueStateText");
			var oCuurentObj = src.getBindingContext("oTimeshetModel").getObject();
			var oCurrentPath = src.getBindingContext("oTimeshetModel").getPath();
			oEvent.getSource().setValue(parseFloat(value).toFixed(2));
			//	var regex = /^(?:[1-9]|[1-9]?\.(?:15|30|45|00))$/;
			var regex = /^[-+]?(?:[0-9][0-9]*|(?:[0-9][0-9]*)?\.(?:25|5|75|00))$/;
			var comparevalue = parseFloat(oEvent.getSource().getValue());
			var test = true;
			if (comparevalue) {
				test = regex.test(parseFloat(oEvent.getSource().getValue()));
			}
			var error = false;
			var dailyTotals;
			var sDailyKey = src.getCustomData()[1].getKey();
			oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "None");
			oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "");
			if (parseFloat(oEvent.getSource().getValue()) > 24) {
				// oEvent.getSource().setValue('0.00');
				// sap.m.MessageBox.show(
				// "Please enter Less than 24 hrs & it will accepts only  .15, .30 & .45 ", {
				// 	icon: sap.m.MessageBox.Icon.ERROR,
				// 	title: "Error",
				// 	actions: [sap.m.MessageBox.Action.OK],
				// 	onClose: function (oAction) {

				// 	}
				// });
				// src.bindProperty("valueState","Error");
				// 	src.bindProperty("valueStateText","Please enter Less than 24 hrs & it will accepts only  .15, .30 & .45 ");
				error = true;
				oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
				oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Time Cann't be GT 24 Hrs");
			} else if (!test) {
				error = true;
				oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
				oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Must enter increments of 0.25, 0.50 or 0.75");

			}
			// else if(parseFloat(oEvent.getSource().getValue()) > 7.5){
			// 		oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
			// //	oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Minutes Can only be 15,30 & 45 mins");
			// }
			if (!error) {
				if (oEvent.getSource().getValue() === "") {
					oEvent.getSource().setValue(parseFloat(0.00).toFixed(2));
				}
				var tableItems = oTimeshetModel.getData().tableItems;

				var RowTotal = parseFloat(oCuurentObj.Day01) + parseFloat(oCuurentObj.Day02) + parseFloat(oCuurentObj.Day03) +
					parseFloat(oCuurentObj.Day04) + parseFloat(oCuurentObj.Day05) + parseFloat(oCuurentObj.Day06) + parseFloat(oCuurentObj.Day07);

				oCuurentObj.TotalHours = RowTotal.toFixed(2);
				oTimeshetModel.updateBindings(true);
				var monday = 0.00,
					Tuesday = 0.00,
					Wedesday = 0.00,
					Tursday = 0.00,
					Friday = 0.00,
					Saturday = 0.00,
					Sunday = 0.00,
					TotalHours = 0.00;
				for (var j = 0; j < tableItems.length; j++) {
					monday = (parseFloat(monday) + parseFloat(tableItems[j].Day01)).toFixed(2);
					Tuesday = (parseFloat(Tuesday) + parseFloat(tableItems[j].Day02)).toFixed(2);
					Wedesday = (parseFloat(Wedesday) + parseFloat(tableItems[j].Day03)).toFixed(2);
					Tursday = (parseFloat(Tursday) + parseFloat(tableItems[j].Day04)).toFixed(2);
					Friday = (parseFloat(Friday) + parseFloat(tableItems[j].Day05)).toFixed(2);
					Saturday = (parseFloat(Saturday) + parseFloat(tableItems[j].Day06)).toFixed(2);
					Sunday = (parseFloat(Sunday) + parseFloat(tableItems[j].Day07)).toFixed(2);
					TotalHours = (parseFloat(TotalHours) + parseFloat(tableItems[j].TotalHours)).toFixed(2);
				}
				oTimeshetModel.getData().tableColumns[0]["Total"] = "Sub Totals";
				oTimeshetModel.getData().tableColumns[2]["Total"] = monday;
				oTimeshetModel.getData().tableColumns[3]["Total"] = Tuesday;
				oTimeshetModel.getData().tableColumns[4]["Total"] = Wedesday;
				oTimeshetModel.getData().tableColumns[5]["Total"] = Tursday;
				oTimeshetModel.getData().tableColumns[6]["Total"] = Friday;
				oTimeshetModel.getData().tableColumns[7]["Total"] = Saturday;
				oTimeshetModel.getData().tableColumns[8]["Total"] = Sunday;
				oTimeshetModel.getData().tableColumns[9]["Total"] = TotalHours;
				me.getView().byId("idProgressIndicator").setPercentValue(+TotalHours);
				oTimeshetModel.updateBindings(true);

				if (sDailyKey === "Day01") {
					if (monday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(monday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// 	oTimeshetModel.setProperty("/tableColumns/2/Total","Warning");
					// }
				}
				if (sDailyKey === "Day02") {
					if (Tuesday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Tuesday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				if (sDailyKey === "Day03") {
					if (Wedesday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Wedesday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				// 		 if(sDailyKey==="Day04"){
				// 		 	if(Wedesday>24){
				// 		 			oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
				// 		oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
				// //		oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
				// 		 	}else if(Wedesday>7.5){
				// 		 		oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
				// 		 	}
				// 		 }
				if (sDailyKey === "Day04") {
					if (Tursday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Tursday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				if (sDailyKey === "Day05") {
					if (Friday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Friday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				if (sDailyKey === "Day06") {
					if (Saturday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Saturday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				if (sDailyKey === "Day07") {
					if (Sunday > 24) {
						oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Error");
						oTimeshetModel.setProperty(oCurrentPath + "/" + sValue, "Daily Time Cann't be GT 24 Hrs");
						//	oTimeshetModel.setProperty(oCurrentPath + "/" + sDailyKey, "0.00");
					}
					// else if(Sunday>7.5){
					// 	oTimeshetModel.setProperty(oCurrentPath + "/" + sKey, "Warning");
					// }
				}
				oTimeshetModel.updateBindings(true);
				me.RowColumnCal();
			}
		},
		RowColumnCal: function () {
			var me = this;
			var oView = me.getView();

			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var tableItems = oTimeshetModel.getData().tableItems;
			for (var i = 0; i < tableItems.length; i++) {
				var RowTotal = parseFloat(tableItems[i].Day01) + parseFloat(tableItems[i].Day02) + parseFloat(tableItems[i].Day03) +
					parseFloat(tableItems[i].Day04) + parseFloat(tableItems[i].Day05) + parseFloat(tableItems[i].Day06) + parseFloat(tableItems[i]
						.Day07);

				tableItems[i].TotalHours = RowTotal.toFixed(2);
			}
			oTimeshetModel.updateBindings(true);
			var monday = 0.00,
				Tuesday = 0.00,
				Wedesday = 0.00,
				Tursday = 0.00,
				Friday = 0.00,
				Saturday = 0.00,
				Sunday = 0.00,
				TotalHours = 0.00;
			for (var j = 0; j < tableItems.length; j++) {
				monday = (parseFloat(monday) + parseFloat(tableItems[j].Day01)).toFixed(2);
				Tuesday = (parseFloat(Tuesday) + parseFloat(tableItems[j].Day02)).toFixed(2);
				Wedesday = (parseFloat(Wedesday) + parseFloat(tableItems[j].Day03)).toFixed(2);
				Tursday = (parseFloat(Tursday) + parseFloat(tableItems[j].Day04)).toFixed(2);
				Friday = (parseFloat(Friday) + parseFloat(tableItems[j].Day05)).toFixed(2);
				Saturday = (parseFloat(Saturday) + parseFloat(tableItems[j].Day06)).toFixed(2);
				Sunday = (parseFloat(Sunday) + parseFloat(tableItems[j].Day07)).toFixed(2);
				TotalHours = (parseFloat(TotalHours) + parseFloat(tableItems[j].TotalHours)).toFixed(2);
			}
			oTimeshetModel.getData().tableColumns[0]["Total"] = "Sub Totals";
			oTimeshetModel.getData().tableColumns[2]["Total"] = monday;
			oTimeshetModel.getData().tableColumns[3]["Total"] = Tuesday;
			oTimeshetModel.getData().tableColumns[4]["Total"] = Wedesday;
			oTimeshetModel.getData().tableColumns[5]["Total"] = Tursday;
			oTimeshetModel.getData().tableColumns[6]["Total"] = Friday;
			oTimeshetModel.getData().tableColumns[7]["Total"] = Saturday;
			oTimeshetModel.getData().tableColumns[8]["Total"] = Sunday;
			oTimeshetModel.getData().tableColumns[9]["Total"] = TotalHours;
			//	me.getView().byId("idProgressIndicator").setPercentValue(+TotalHours);
			oTimeshetModel.updateBindings(true);
		},
		//CR:376   This method navigate the user Report Application. 
		onHistoryPress: function (oEvent) {
			var a = new sap.m.BusyDialog();
			a.open();
			a.setBusyIndicatorDelay(0);
			var self = this;
			var oView = self.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var Locked;
			if (oTimeshetModel.getData().tableItems.length) {
				Locked = oTimeshetModel.getData().tableItems[0].Lock;
			} else {
				Locked = "";
			}
			if (oTimeshetModel.getProperty("/usereditable") && Locked != "X" && this.Saved != "X") {
				sap.m.MessageBox.show(
					"Do you want to save your changes?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {

							if (oAction === "YES") {
								self.onSavePress(oEvent, "Save");
								oTimeshetModel.setProperty("/usereditable", false);
								a.close();
							} else {
								var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
								var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
									target: {
										semanticObject: "ZProjectTime",
										action: "monitor"
									}

								})) || "";
								oCrossAppNavigator.toExternal({
									target: {
										shellHash: hash
									}
								});
								a.close();
							}
						}
					});
			} else {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "ZProjectTime",
						action: "monitor"
					}

				})) || "";
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});

				a.close();

			}
			// navigate to Supplier application

		},
		//CR:376   This method trrigers when + add new project in the Time sheet Application. 
		handleProjectValueHelp: function (oEvent) {
			var me = this;
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			var ReportModel = this.getOwnerComponent().getModel();
			// create value help dialog
			if (!this._ProjectvalueHelpDialog) {
				this._ProjectvalueHelpDialog = sap.ui.xmlfragment(
					"ProjectTime.ZProjectTime.fragment.NewProjectCreate",
					this
				);
				this.getView().addDependent(this._ProjectvalueHelpDialog);
			}

			// create a filter for the binding
			// this._ProjectvalueHelpDialog.getBinding("items").filter([new Filter(
			// 	"Name",
			// 	sap.ui.model.FilterOperator.Contains, sInputValue
			// )]);

			// open value help dialog filtered by the input value
			this._ProjectvalueHelpDialog.open();
			//	var oTable = sap.ui.getCore().byId("idWBSTable");

			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			var weekNumber = oTimeshetModel.getProperty("/WeekNumber");
			var year = oTimeshetModel.getProperty("/Year");

			var aFilters = [];
			var id;

			aFilters.push(new sap.ui.model.Filter("WeekNo", sap.ui.model.FilterOperator.EQ, weekNumber));
			aFilters.push(new sap.ui.model.Filter("Year", sap.ui.model.FilterOperator.EQ, year));
			if (sap.ui.Device.system.phone) {
				id = "MidWBSTable";
			} else {
				id = "idWBSTable";
			}
			var oTable = sap.ui.getCore().byId(id);
			// oTable.unbindItems();
			// var oTemplate = new sap.m.ColumnListItem({
			// 	cells: [
			// 		new sap.m.Text({
			// 			text: "{ReportModel>ProjectCode}"

			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Txt}"

			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Level}"
			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>Project_Def}"
			// 		}),
			// 		new sap.m.Text({
			// 			text: "{ReportModel>T_Area}"
			// 		})
			// 	]
			// });
			//	var path = "ReportModel>/Sch_ProjectCodeSet(ProjectCode='" + WBS + "',Txt='" + Description + "',Project_Def='" + ProjectDefination +"')";
			// var path = "ReportModel>/Sch_ProjectCodeSet(ProjectCode='" + WBS + "')";
			//	oTable.bindItems(path, oTemplate);
			oTable.getBinding("items").filter(aFilters);

		},
		//CR:376   This method trrigers when cancel the new projecte create Dialog Time sheet Application.
		onProjectCancelPress: function () {
			this._ProjectvalueHelpDialog.close();
		},
		//CR:376   This method trrigers when WBS PROJECT selects in wbs dialog.it will read the selected Row details and update the oNewProject Model
		onProjectSelect: function (oEvent) {
			var me = this;
			var oView = me.getView();
			var oNewProjectModel = oView.getModel("oNewProjectModel");
			var oCurrentObject = oEvent.getParameter("listItem").getBindingContext().getObject();
			oNewProjectModel.getData()["ProjectCode"] = oCurrentObject.ProjectCode;
			oNewProjectModel.getData()["ProjectDescrption"] = oCurrentObject.Txt;
			oNewProjectModel.updateBindings(false);
			this._ProjectvalueHelpDialog.close();
			this._ProjectvalueHelpDialog.destroy(true);
			this._ProjectvalueHelpDialog = undefined;
		},
		_handleProjectValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			// var oFilter = new Filter(
			// 	"ProjectCode",
			// 	sap.ui.model.FilterOperator.Contains, sValue
			// );
			var oFilter = new Filter({
				filters: [
					new Filter("ProjectCode", FilterOperator.Contains, sValue),
					new Filter("Txt", FilterOperator.Contains, sValue)
				],
				and: false
			});
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleProjectValueHelpClose: function (evt) {
			var me = this;
			var oView = me.getView();
			var oNewProjectModel = oView.getModel("oNewProjectModel");

			var oSelectedItem = evt.getParameter("selectedItem");

			if (oSelectedItem) {
				// var productInput = this.byId(this.inputId);
				// productInput.setValue(oSelectedItem.getTitle());
				oNewProjectModel.getData()["ProjectCode"] = oSelectedItem.getTitle();
				oNewProjectModel.getData()["ProjectDescrption"] = oSelectedItem.getDescription();
				oNewProjectModel.updateBindings(false);
			}
			evt.getSource().getBinding("items").filter([]);
		},
		//CR:376   This method trrigers when click on date in The Timesheet Table Column Header section.
		onColumnNotePress: function (oEvent) {
			var me = this;
			this.onMainNotePress(oEvent);
		},
		//CR:376   This method trrigers when click on notes button and it will opne the notes dialog.
		onMainNotePress: function (oEvent) {
			var me = this;
			this.oSrc = oEvent.getSource();
			var oCustomDataValue = oEvent.getSource().getCustomData()[0].getValue();
			me.oCustomDataNoteskey = oEvent.getSource().getCustomData()[0].getKey();
			me.getView().getModel("oTimeshetModel").setProperty("/Notes", oCustomDataValue);
			if (!this._NotesDialog) {
				this._NotesDialog = sap.ui.xmlfragment(
					"ProjectTime.ZProjectTime.fragment.Notes",
					this
				);
				this.getView().addDependent(this._NotesDialog);
			}

			if (me.oCustomDataNoteskey === "ProjectNote") {
				this._NotesDialog.getCustomHeader().getContent()[1].setText("Comments");
			} else if (me.oCustomDataNoteskey === "MainNote") {
				this._NotesDialog.getCustomHeader().getContent()[1].setText("Add  Notes for week #" + me.getView().getModel("oTimeshetModel").getProperty(
					"/WeekNumber"));
			} else {

				this._NotesDialog.getCustomHeader().getContent()[1].setText("Daily Notes");

			}

			this._NotesDialog.open();

			// // create popover
			// if (!this._NotesDialog) {
			// 	sap.ui.core.Fragment.load({
			// 		name: "ProjectTime.ZProjectTime.fragment.Notes",
			// 		controller: this
			// 	}).then(function (pPopover) {
			// 		this._NotesDialog = pPopover;
			// 		this.getView().addDependent(this._NotesDialog);
			// 		//	this._oPopover.bindElement("/ProductCollection/0");
			// 		this._NotesDialog.open();
			// 	}.bind(this));
			// } else {
			// 	this._NotesDialog.open();
			// }
		},
		//CR:376   This method trrigers when click on save button in the notes dialog.and update the Notes details in oTimesheet Model
		onAddNotesPress: function () {
			var me = this;
			var oCurrentNoteText = me.getView().getModel("oTimeshetModel").getProperty("/Notes");
			if (me.oCustomDataNoteskey === "ProjectNote") {
				var oCurrentObj = me.oSrc.getBindingContext("oTimeshetModel").getObject();
				oCurrentObj.Note = oCurrentNoteText;
			} else if (me.oCustomDataNoteskey === "MainNote") {
				me.getView().getModel("oTimeshetModel").setProperty("/VacationNotes", oCurrentNoteText);
			} else {
				me.getView().getModel("oNotesModel").setProperty("/" + me.oCustomDataNoteskey, oCurrentNoteText);
			}
			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			oTimeshetModel.setProperty("/usereditable", true);
			me.getView().getModel("oTimeshetModel").updateBindings(true);
			me.getView().getModel("oNotesModel").updateBindings(true);
			this._NotesDialog.close();
		},
		//CR:376   This method trrigers when click on delet button in the notes dialog.and update the Notes details in oTimesheet Model
		onDeleteNotesPress: function () {
			var me = this;
			var oCurrentNoteText = me.getView().getModel("oTimeshetModel").getProperty("/Notes");
			if (me.oCustomDataNoteskey === "ProjectNote") {
				var oCurrentObj = me.oSrc.getBindingContext("oTimeshetModel").getObject();
				oCurrentObj.Note = "";
			} else if (me.oCustomDataNoteskey === "MainNote") {
				me.getView().getModel("oTimeshetModel").setProperty("/VacationNotes", "");
			} else {
				me.getView().getModel("oNotesModel").setProperty("/" + me.oCustomDataNoteskey, "");
			}
			me.getView().getModel("oTimeshetModel").setProperty("/Notes", "");
			me.getView().getModel("oTimeshetModel").updateBindings(true);
			me.getView().getModel("oNotesModel").updateBindings(true);
			var oTimeshetModel = me.getView().getModel("oTimeshetModel");
			oTimeshetModel.setProperty("/usereditable", true);
			this._NotesDialog.close();
		},
		//CR:376   This method trrigers when click on cancel button in the notes dialog.and it will close the Notes dialg
		onCancelNotesPress: function () {
			this._NotesDialog.close();
		},
		//CR:376   This method trrigers when click on add button in the Timesheet application.it will open new project dialog .
		onProjectAddPress: function (oEvent) {
			var me = this;
			var oNewProjectModel = me.getView().getModel("oNewProjectModel");

			oNewProjectModel.setProperty("/ProjectCode", ""); //this._newProject.getContent()[0].getContent()[1].getValue();
			oNewProjectModel.setProperty("/ProjectDescrption", "");
			oNewProjectModel.setProperty("/ResourceType", "");
			var oButton = oEvent.getSource();
			var a = new sap.m.BusyDialog();
			a.open();
			a.setBusyIndicatorDelay(0);
			var self = this;
			var oView = self.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var Locked;
			if (oTimeshetModel.getData().tableItems.length) {
				Locked = oTimeshetModel.getData().tableItems[0].Lock;
			} else {
				Locked = "";
			}
			if (oTimeshetModel.getProperty("/usereditable") && Locked != "X" && this.Saved != "X") {
				sap.m.MessageBox.show(
					"Do you want to save your changes?", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Confirm",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {

							if (oAction === "YES") {
								self.onSavePress(oEvent, "Save");
								oTimeshetModel.setProperty("/usereditable", false);
								a.close();
							} else {
								if (!self._newProject) {
									self._newProject = sap.ui.xmlfragment(
										"ProjectTime.ZProjectTime.fragment.NewProject",
										self
									);
									self.getView().addDependent(self._newProject);
								}
								self._newProject.open();
								a.close();
							}
						}
					});
			} else {

				if (!self._newProject) {
					self._newProject = sap.ui.xmlfragment(
						"ProjectTime.ZProjectTime.fragment.NewProject",
						self
					);
					self.getView().addDependent(self._newProject);
				}
				self._newProject.open();
				a.close();

			}

			// create popover
			// if (!this._newProject) {
			// 	sap.ui.core.Fragment.load({
			// 		name: "ProjectTime.ZProjectTime.fragment.NewProject",
			// 		controller: this
			// 	}).then(function (pPopover) {
			// 		this._newProject = pPopover;
			// 		this.getView().addDependent(this._newProject);
			// 		//	this._oPopover.bindElement("/ProductCollection/0");
			// 		this._newProject.open();
			// 	}.bind(this));
			// } else {
			// 	this._newProject.open();
			// }
		},
		//CR:376   This method trrigers on add button new project dialog.it will create new project for current week .
		onTimeEntryOkPress: function () {
			var me = this;
			var oView = me.getView();
			var oNewProjectModel = oView.getModel("oNewProjectModel");

			var Project = oNewProjectModel.getData()["ProjectCode"]; //this._newProject.getContent()[0].getContent()[1].getValue();
			var ProjectDesc = oNewProjectModel.getData()["ProjectDescrption"];
			var ResourceType = oNewProjectModel.getData()["ResourceType"]; //this._newProject.getContent()[0].getContent()[3].getSelectedKey();
			//	this._newProject.getContent()
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			var DuplicteArray = [];
			oTimeshetModel.getData().tableItems.filter(function (obj, index) {
				if (obj.Projectcode === Project && obj.ResourceType === ResourceType) {
					return DuplicteArray.push(obj);
				}
			});

			if (DuplicteArray.length) {
				sap.m.MessageBox.error("Selected record is already exist");
				return;
			}

			var ActualObj = {
				"Projectcode": Project,
				"ResourceType": ResourceType,
				"WeekNo": oTimeshetModel.getProperty("/WeekNumber").toLocaleString(),
				"User": "",
				"Year": oTimeshetModel.getProperty("/Year") + "",
				"ProjectDesc": ProjectDesc,
				"TypeDesc": "",
				"Day01": "0.00",
				"Day02": "0.00",
				"Day03": "0.00",
				"Day04": "0.00",
				"Day05": "0.00",
				"Day06": "0.00",
				"Day07": "0.00",
				"Note": "",
				"StartDate": "",
				"Lock": "",
			};
			var obj = {

				"TotalHours": '0.00',
				"Day0valueStateText": "",
				"Day0valueState": "None",
				"Day1valueState": "None",
				"Day2valueStateText": "",
				"Day2valueState": "None",
				"Day3valueStateText": "",
				"Day3valueState": "None",
				"Day4valueStateText": "",
				"Day4valueState": "None",
				"Day5valueStateText": "",
				"Day5valueState": "None",
				"Day6valueStateText": "",
				"Day6valueState": "None",
				"Day7valueStateText": "",
				"Day7valueState": "None",
				"valueStateText": "",
				"valueState": "None",

			};
			var oDataModel = this.getOwnerComponent().getModel();
			if (Project !== "" && ResourceType !== "") {
				oDataModel.create('/TimeSheetSet', ActualObj, {
					success: function (oData) {
						sap.m.MessageToast.show("Timesheet Created Successfully");
						me._GetData();
						// var fullObj = Object.assign({}, obj, oData);
						// oTimeshetModel.getData().tableItems.unshift(fullObj);

						// oTimeshetModel.updateBindings(false);
					},
					error: function (oError) {

					}
				});
				this._newProject.close();
			} else {
				sap.m.MessageToast.show("Project Code and Resource Type are Mandatory");
			}

		},
		//CR:376   This method trrigers on cancel button new project dialog.it will close the new project dialog.
		onTimeEntryCancelPress: function () {
			this._newProject.close();
		},
		//CR:376   This method calculates the start of week based on current date.
		startOfWeek: function (date) {
			var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
			return new Date(date.setDate(diff));
		},
		//CR:376   This method calculates the total  week dates.
		GetDates: function (startDate, daysToAdd) {
			var aryDates = [];
			var me = this;
			var scurrentDate;
			var oView = me.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			for (var i = 0; i <= daysToAdd; i++) {
				// var currentDate = new Date();
				// currentDate.setDate(startDate.getDate() + i);
				var currentDate = new Date(startDate.getTime() + (86400000 * i));
				if (currentDate.getDate() <= 9) {
					scurrentDate = "0" + currentDate.getDate();
				} else {
					scurrentDate = currentDate.getDate();
				}
				if (sap.ui.Device.system.phone) {
					aryDates.push({
						"DisplayDate": this.DayAsString(currentDate.getDay()) + "  " + scurrentDate + " ",
						"Date": currentDate
					});
				} else {
					aryDates.push({
						"DisplayDate": this.DayAsString(currentDate.getDay()) + "," + scurrentDate + " ",
						"Date": currentDate
					});
				}
				//	this.MonthAsString(currentDate.getMonth()) +" " + currentDate.getFullYear());
				if (i === 6) {
					oTimeshetModel.setProperty("/EndDateMonth", currentDate.getDate() + " " + this.MonthAsString(currentDate.getMonth()) + " " +
						currentDate.getFullYear());
					// Start -Changes By Ajay 12th dec 2020
					oTimeshetModel.setProperty("/EndDateofTitle", currentDate);
					// End -Changes By Ajay 12th dec 2020
				}
				// Start -Changes By Ajay 12th dec 2020
				if (i === 0) {
					oTimeshetModel.setProperty("/StartDateofTitle", currentDate);
				}
				// End -Changes By Ajay 12th dec 2020
			}

			return aryDates;
		},
		//CR:376   This method calculates the months based of month index.
		MonthAsString: function (monthIndex) {
			var d = new Date();
			var month = new Array();
			month[0] = "January";
			month[1] = "February";
			month[2] = "March";
			month[3] = "April";
			month[4] = "May";
			month[5] = "June";
			month[6] = "July";
			month[7] = "August";
			month[8] = "September";
			month[9] = "October";
			month[10] = "November";
			month[11] = "December";

			return month[monthIndex];
		},
		//CR:376   This method calculates the days based of days index.
		DayAsString: function (dayIndex) {
			var weekdays = new Array(7);
			weekdays[0] = "SUN";
			weekdays[1] = "MON";
			weekdays[2] = "TUE";
			weekdays[3] = "WED";
			weekdays[4] = "THU";
			weekdays[5] = "FRI";
			weekdays[6] = "SAT";

			return weekdays[dayIndex];
		},
		//CR:376   This method calculates notes data length based upon it shows warning message
		handleLiveChange: function (oEvent) {
			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? "Warning" : "None";

			oTextArea.setValueState(sState);
		},
		//CR:376   This method triggers when click on delete button and it will delete current week selected project.
		handleDeleteRecord: function (CurrentObj) {
			var me = this;
			var oView = me.getView();
			var oDataModel = oView.getModel();
			var Projectcode = encodeURIComponent(CurrentObj.Projectcode);
			//changed by skommuru
			/*encodeURIComponent(Projectcode);
			decodeURIComponent(Projectcode);
*/
			// if (CurrentObj.Projectcode.indexOf("/") != -1) {
			// 	Projectcode = Projectcode.replace(/\//g, '%2F');
			// } else if (CurrentObj.Projectcode.indexOf("&") != -1) {
			// 	Projectcode = Projectcode.replace(/&/g, '%26');
			// }

			var sPath = "/TimeSheetSet(Projectcode='" + Projectcode + "',ResourceType='" + CurrentObj.ResourceType + "',WeekNo='" +
				CurrentObj.WeekNo + "',User='',Year='" + CurrentObj.Year + "')";
			oDataModel.remove(sPath, {
				success: function (oData) {
					sap.m.MessageToast.show("Timesheet Project Deleted Successfully");
					me._GetData();

				},
				error: function (oError) {

				}
			});
		},
		//CR:376   This method triggers when click on delete button and it will delete current week selected project.
		onProjectDeletePress: function (oEvent) {
			var me = this;
			var selItem;
			var oView = me.getView();
			var oTimeshetModel = oView.getModel("oTimeshetModel");
			//	var CurrentObj = oEvent.getSource().getBindingContext("oTimeshetModel").getObject();
			//		var CurrentPath = oEvent.getSource().getBindingContext("oTimeshetModel").sPath;

			if (sap.ui.Device.system.phone) {
				selItem = oEvent.getSource().getBindingContext("oTimeshetModel");
			} else {
				selItem = this.getView().getContent()[0].getContent()[1].getSelectedItem();
			}

			if (selItem) {
				if (sap.ui.Device.system.phone) {
					selItem = oEvent.getSource().getBindingContext("oTimeshetModel");
				} else {
					selItem = this.getView().getContent()[0].getContent()[1].getSelectedItem().getBindingContext("oTimeshetModel");
				}
				if (selItem.getObject().WBSType === "A" || selItem.getObject().WBSType === "V" || selItem.getObject().WBSType === "C") {} else {
					sap.m.MessageBox.show(
						"Are you Sure want to delete the Project", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "Confirm",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === "YES") {
									var CurrentObj = selItem.getObject();
									me.handleDeleteRecord(CurrentObj);
									// var CurrentPath = selItem.sPath;

									// var Index = parseInt(CurrentPath.substring(CurrentPath.lastIndexOf('/') + 1));

									// oTimeshetModel.getData().tableItems.splice(Index, 1);
									// oTimeshetModel.updateBindings(true);
								}
							}
						});
				}
			} else {
				sap.m.MessageBox.show(
					"Please Select Atleast One Project", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function (oAction) {}
					});

			}

		},
		//CR:376   This method triggers when click on Title in the project and remaining details will shown in the projectpopover..
		onMobilTitlePress: function (oEvent) {
			var me = this;
			var oView = me.getView();
			var oCurrentObject = oEvent.getSource().getBindingContext("oTimeshetModel").getObject();
			if (!this._oProjectPopover) {
				this._oProjectPopover = sap.ui.xmlfragment("ProjectTime.ZProjectTime.fragment.Projectpopover", this);
				this.getView().addDependent(this._oProjectPopover);
				//	this._oProjectPopover.bindElement("/ProductCollection/0");
			}

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oSrc = oEvent.getSource();
			var Content = this._oProjectPopover.getContent()[0].getItems()[0].getContent();
			jQuery.sap.delayedCall(0, this, function () {
				Content[1].setText(oCurrentObject.Projectcode);
				Content[3].setText(oCurrentObject.ProjectDesc);
				Content[5].setText(oCurrentObject.ResourceType);
				Content[7].setText(oCurrentObject.TypeDesc);
				this._oProjectPopover.openBy(oSrc);
			});
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("Vbeln")
			});
		}

	});
});