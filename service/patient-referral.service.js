const dao = require('../etl-dao');
const Promise = require("bluebird");
const Moment = require('moment');
const _ = require('lodash');
import {
    BaseMysqlReport
} from '../app/reporting-framework/base-mysql.report'
import {
    PatientlistMysqlReport
} from '../app/reporting-framework/patientlist-mysql.report'
import {
    PatientReferralAggregateService
} from './patient-referral-aggregate.service'
export class PatientReferralService {

  
    getAggregateReport(reportParams) {
        var locationUuids = [];
        var stateUuids = [];
        var providerUuids = [];
        var programUuids= [];
        // format locationUuids
        if (reportParams.locationUuids) {
            _.each(reportParams.locationUuids.split(','), function (loc) {
                locationUuids.push(String(loc));
            });
        }
        reportParams.locationUuids= locationUuids;
        //format StateUuids
        if (reportParams.stateUuids) {
            _.each(reportParams.stateUuids.split(','), function (s) {
                stateUuids.push(String(s));
            });
        }
        reportParams.stateUuids= stateUuids;

        if (reportParams.programUuids) {
            _.each(reportParams.programUuids.split(','), function (s) {
                programUuids.push(String(s));
            });
        }
        reportParams.programUuids= programUuids;

        console.log('reportParams===reportParams',reportParams);
        let self = this;
        return new Promise(function (resolve, reject) {
            reportParams.groupBy = 'groupByLocation,groupByProgram,groupByState';
            reportParams.countBy = 'num_persons';
            let report = new PatientReferralAggregateService('referralAggregate',reportParams);
            Promise.join(report.generateReport(reportParams),
                (results) => {
                //TODO Do some post processing
                    results= results.results;
                    resolve(results);

                }).catch((errors) => {
                    reject(errors);
                });
        });
    }
    
    getPatientListReport(reportParams) {
        let self = this;
        return new Promise(function (resolve, reject) {
            reportParams.groupBy = 'groupByPerson';
            //TODO: Do some pre processing
            Promise.join(dao.runReport(reportParams),
                (results) => {
                    resolve(results);
                }).catch((errors) => {
                    reject(errors);
                });
        });
    }
    getPatientListReport2(reportParams) {
        let self = this;
        return new Promise(function (resolve, reject) {
            reportParams.groupBy = 'groupByPerson';

            let report = new PatientlistMysqlReport('referralAggregate',reportParams);
            Promise.join(report.generatePatientListReport([]),
                (results) => {
                    results.result=results.results.results;
                    resolve(results);
                }).catch((errors) => {
                    reject(errors);
                });
        });
    }
}