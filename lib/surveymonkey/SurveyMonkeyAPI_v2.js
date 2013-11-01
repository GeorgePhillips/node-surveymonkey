var http = require('http'),
    request = require('request'),
    helpers = require('./helpers');

/**
 * SurveyMonkey API wrapper for the API version 1.3. This object should not be 
 * instantiated directly but by using the version wrapper {@link SurveyMonkeyAPI}.
 * 
 * @param apiKey The API key to access the SurveyMonkey API with
 * @param options Configuration options
 * @return Instance of {@link SurveyMonkeyAPI_v1_3}
 */
function SurveyMonkeyAPI_v2 (apiKey, accessToken, options) {

  if (!options) {
    options = {};
  }

  this.version     = 'v2';
  this.apiKey      = apiKey;
  this.accessToken = accessToken || '';
  this.secure      = options.secure || false;
  this.packageInfo = options.packageInfo;
  this.httpUri     = (this.secure) ? 'https://api.surveymonkey.net' : 'https://api.surveymonkey.net';
  this.userAgent   = options.userAgent+' ' || '';
}

module.exports = SurveyMonkeyAPI_v2;

/**
 * Sends a given request as a JSON object to the SurveyMonkey API and finally
 * calls the given callback function with the resulting JSON object. This 
 * method should not be called directly but will be used internally by all API
 * methods defined.
 * 
 * @param resource SurveyMonkey API resource to call
 * @param method SurveyMonkey API method to call
 * @param availableParams Parameters available for the specified API method
 * @param givenParams Parameters to call the SurveyMonkey API with
 * @param callback Callback function to call on success 
 */
SurveyMonkeyAPI_v2.prototype.execute = function (resource, method, availableParams, givenParams, callback) {

  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  request({
    uri : this.httpUri + '/' + this.version + '/' + resource + '/' + method + "?api_key=" + this.apiKey,
    method: 'POST',
    //headers : { 'User-Agent' : this.userAgent+'node-surveymonkey/'+this.packageInfo.version },
    headers : { 'Authorization' : 'bearer ' + this.accessToken,
                'Content-Type' : 'application/json' },
    body : JSON.stringify(finalParams)
  }, function (error, response, body) {
    var parsedResponse;
    if (error) {
      callback(new Error('Unable to connect to the SurveyMonkey API endpoint.'));
    } else {

      try {
        parsedResponse = JSON.parse(body);
      } catch (error) {
        callback(new Error('Error parsing JSON answer from SurveyMonkey API.'));
        return;
      }

      if (parsedResponse.errmsg) {
        callback(helpers.createSurveyMonkeyError(parsedResponse.errmsg, parsedResponse.status));
        return;
      }

      callback(null, parsedResponse);

    }
  });

};

/*****************************************************************************/
/************************* Survey Related Methods **************************/
/*****************************************************************************/

/**
 * Retrieves a paged list of respondents for a given survey and optionally collector
 * 
 * @see https://developer.surveymonkey.com/mashery/get_respondent_list
 */
SurveyMonkeyAPI_v2.prototype.getRespondentList = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_respondent_list', [
      'survey_id',
      'fields',
      'start_modified_date'
    ], params, callback);
};

/**
 * Takes a list of respondent ids and returns the responses that correlate to them. To be used with 'get_survey_details'
 * 
 * @see https://developer.surveymonkey.com/mashery/get_responses
 */
SurveyMonkeyAPI_v2.prototype.getResponses = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_responses', [
      'survey_id',
      'respondent_ids'
    ], params, callback);
};

/**
 * Retrieve a given survey's metadata.
 * 
 * @see https://developer.surveymonkey.com/mashery/get_survey_details
 */
SurveyMonkeyAPI_v2.prototype.getSurveyDetails = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_survey_details', [
      'survey_id'
    ], params, callback);
};

/**
 * Retrieves a paged list of surveys in a user's account.
 * 
 * @see https://developer.surveymonkey.com/mashery/get_survey_list
 */
SurveyMonkeyAPI_v2.prototype.getSurveyList = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_survey_list', [], params, callback);
};

/**
 * Retrieves a paged list of surveys in a user's account.
 * 
 * @see https://developer.surveymonkey.com/mashery/get_collector_list
 */
SurveyMonkeyAPI_v2.prototype.getCollectorList = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_collector_list', [
      'survey_id'
    ], params, callback);
};

/**
 * Returns how many respondents have started and/or completed the survey for the given collector.
 * 
 * @see https://developer.surveymonkey.com/mashery/get_response_counts
 */
SurveyMonkeyAPI_v2.prototype.getResponseCounts = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('surveys', 'get_response_counts', [
      'collector_id'
    ], params, callback);
};

/**
 * Returns basic information about the logged-in user.
 * 
 * @see https://developer.surveymonkey.com/mashery/get_user_details
 */
SurveyMonkeyAPI_v2.prototype.getUserDetails = function (params, callback) {
  if (typeof params === 'function') callback = params, params = {};
  this.execute('user', 'get_user_details', [], params, callback);
};
