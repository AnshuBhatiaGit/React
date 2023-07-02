import React, { useState, useEffect } from "react";
import fetch from '../api/dataservice';
import {Table} from './Table'
import "../App.css";


function calulatePonits(amount){
    let points = 0;
    if (amount > 100) {    
      points = 2*(amount-100)+50;
    } else if (amount > 50 && amount<=100) {
      points = amount - 50;      
    }
    else{
      points = 0;
    }
    return points;
}



function App() {
  const [data, setData] = useState(null);
  useEffect(() => { 
    fetch().then((data)=> {             
      const info = buildInfo(data);      
      setData(info);
    });
  },[]);

  if (data == null) {
    return <div>Loading...</div>;   
  }

  return <div>   
      <div className="container">
        <div className="row">
          <div className="col-8">
            <br></br><br></br>
            <Table
              data={data}
               />             
            </div>
          </div>
        </div>     
    </div>
  ;
}

function buildInfo(data) {
  const pointsPerTransaction = data.map(transaction=> {
    let points = calulatePonits(transaction.amount);
    const month = new Date(transaction.transactionDate).getMonth();
    return {...transaction, points, month};
  });
  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let {customerId, name, month, points, transactionDate} = pointsPerTransaction;   
    if (!byCustomer[customerId]) {
      byCustomer[customerId] = [];      
    }    
    if (!totalPointsByCustomer[customerId]) {
      totalPointsByCustomer[customerId] = 0;
    }
   
    totalPointsByCustomer[customerId] += points;
    
    if (byCustomer[customerId][month]) {
      byCustomer[customerId][month].points += points;
      byCustomer[customerId][month].monthNumber = month;
      byCustomer[customerId][month].numTransactions++;      
    } else {
      byCustomer[customerId][month] = {
        customerId,
        name,
        month:new Date(transactionDate).toLocaleString('en-us',{month:'long'}),
        numTransactions: 1,        
        points
      }
    }    
  });
  
  return {
    summaryByCustomer: buildSummaryInfo(byCustomer, totalPointsByCustomer),
    pointsPerTransaction
  };
}

function buildSummaryInfo(byCustomer, totalPointsByCustomer){
  let summary = [];
  for (let custKey in byCustomer) {    
    byCustomer[custKey].forEach(cRow=> {
      cRow.totalPointsByCustomer = totalPointsByCustomer[custKey];
      summary.push(cRow);
    });    
  }
  return summary;
}
export default App;
