const hubspot = require('@hubspot/api-client');

exports.main = async (event, callback) => {

//Node.js 16.x
//HubSpot Client V3
//Property to include in code: hs_object_id = deal record ID
//Created on 6/23/2023 by Nathan De Long. Code is provided as is with no guarantee of fitness for any particular purpose; please test in a test portal before using in a live environment.

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.hstoken
  });
  
  try{
  //get the id of the rep contact object associated with the deal
  
  const hs_object_id = event.inputFields['hs_object_id'];
  //first, reach out to the associations API to get the rep contact associated with the deal. 
  const apiResponse = await hubspotClient
              .apiRequest({
              method: 'GET',
              path: `/crm/v4/objects/deal/${hs_object_id}/associations/p40072073_rep_contacts`,
              body: {}
            });
  //show the rep contact object associated with the deal in the console
  //console.log(JSON.stringify(apiResponse.body, null, 2));
  //put the ID for the associated rep contact object into a variable
  const repContact = apiResponse.body.results.map(resultItem => resultItem.toObjectId);
  //log to the console for debugging
  console.log(`The rep contact ID is: ${repContact}`);
    
  //now, get the contact id associated with the rep contact object
  const apiResponse2 = await hubspotClient
              .apiRequest({
              method: 'GET',
              path: `/crm/v4/objects/p40072073_rep_contacts/${repContact}/associations/contacts`,
              body: {}
            });
  //show the real contact associated with the rep contact in the console
  //console.log(JSON.stringify(apiResponse2.body, null, 2));
  //put the ID for the real contact associated with the rep contact into a variable
  const contact = apiResponse2.body.results.map(resultItem => resultItem.toObjectId);
  //log to the console for debugging
  console.log(`The contact ID is: ${contact}`);
  const contactStr = contact.toString();
  console.log(contactStr);
  
  //now, get the company id associated with the rep contact object  
  const apiResponse3 = await hubspotClient
              .apiRequest({
              method: 'GET',
              path: `/crm/v4/objects/p40072073_rep_contacts/${repContact}/associations/companies`,
              body: {}
            });
  //show the company associated with the rep contact in the console
  //console.log(JSON.stringify(apiResponse3.body, null, 2));
  //put the ID for the company associated with the rep contact into a variable
  const company = apiResponse3.body.results.map(resultItem => resultItem.toObjectId);
  //log to the console for debugging
  console.log(`The company ID is: ${company}`);
  const companyStr = company.toString();
  console.log(companyStr)
  
  //now, associate the contact to the deal
  const BatchInputPublicAssociation = { inputs: [{"from":{"id":contactStr},"to":{"id":hs_object_id},"type":"contact_to_deal"}] };
  const fromObjectType = "contact";
  const toObjectType = "deal";

  const apiResponse4 = await hubspotClient.crm.associations.batchApi.create(fromObjectType, toObjectType, BatchInputPublicAssociation);
  //console.log(JSON.stringify(apiResponse4, null, 2));
    
  //now, associate the company to the deal
  const BatchInputPublicAssociation2 = { inputs: [{"from":{"id":companyStr},"to":{"id":hs_object_id},"type":"company_to_deal"}] };
  const fromObjectType2 = "company";
  const toObjectType2 = "deal";

  const apiResponse5 = await hubspotClient.crm.associations.batchApi.create(fromObjectType2, toObjectType2, BatchInputPublicAssociation2);
  //console.log(JSON.stringify(apiResponse5, null, 2));
    
  } catch (e) {
    e.message === 'HTTP request failed'
      ? console.error(JSON.stringify(e.response, null, 2))
      : console.error(e)
  }
  }
