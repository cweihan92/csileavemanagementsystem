import React, { Component } from "react";
import { Button, Row, Col } from "reactstrap";
import { Link, Redirect, withRouter } from "react-router-dom";
import {
  fetchData,
  isManagerRole,
  formatDateYMD,
  formatDateDMY
} from "../util/APIUtils";
import { API_BASE_URL } from "../constants";
import "../common/Styles.css";
import ReactTable from "react-table";
import "react-table/react-table.css";
import ExportToExcel from "./LeaveHistoryToExcel";

class LeaveHistoryList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leaveHistoryData: [],
      loading: true
    };
    this.loadHistoryData = this.loadHistoryData.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
  }

  loadHistoryData() {
    // fetch leave request from API
    const thisYear = new Date().getFullYear();
    fetchData({
      url: API_BASE_URL + "/appliedleave/me/" + thisYear,
      method: "GET"
    })
      .then(data => {
        this.setState({ leaveHistoryData: data, loading: false });
      })
      .catch(err => {
        // if unable to fetch data, assign default (spaces) to values
        let leaveHistory = [];
        this.setState({ leaveHistoryData: leaveHistory, loading: false });
      });
  }

  componentDidMount() {
    this.loadHistoryData();
  }

  componentDidUpdate() {
    this.loadHistoryData();
  }

  render() {
    if (!isManagerRole(this.props.currentUser)) {
      return <Redirect to="/forbidden" />;
    }

    const showFullStatus = strStatus => {
      if (strStatus === "PNAPV") {
        return "Pending Approve";
      } else if (strStatus === "APPRV") {
        return "Approved";
      } else if (strStatus === "CANCL") {
        return "Cancelled";
      } else if (strStatus === "PNCLD") {
        return "Pending Cancel";
      } else if (strStatus === "REJCT") {
        return "Rejected";
      }
    };

    const showFullString = strHalfDay => {
      if (strHalfDay === "Y") {
        return "Yes";
      } else {
        return "No";
      }
    };

    const leaveHistoryCols = [
      {
        id: "emplId",
        Header: "Employee ID",
        accessor: "id.emplid",
        width: 120,
        sortable: true,
        filterable: true
      },
      {
        id: "name",
        Header: "Employee Name",
        accessor: "employeeDetails.name",
        minWidth: 180,
        sortable: true,
        filterable: true
      },
      {
        id: "leaveType",
        Header: "Leave Type",
        accessor: "leaveCategory.leaveDescr",
        minWidth: 150,
        sortable: true,
        filterable: true
      },
      {
        id: "startDate",
        Header: "Start Date",
        accessor: d => formatDateDMY(d.id.startDate),
        minWidth: 100,
        sortable: true,
        filterable: true,
        style: {
          textAlign: "center"
        }
      },
      {
        id: "endDate",
        Header: "End Date",
        accessor: d => formatDateDMY(d.endDate),
        minWidth: 100,
        sortable: true,
        filterable: true,
        style: {
          textAlign: "center"
        }
      },
      {
        id: "halfDay",
        Header: "Half Day",
        accessor: str => showFullString(str.halfDay),
        minWidth: 90,
        sortable: true,
        filterable: true,
        style: {
          textAlign: "center"
        }
      },
      {
        id: "Duration",
        Header: "Duration",
        accessor: str => str.leaveDuration + " day(s)",
        minWidth: 120,
        sortable: true,
        filterable: true,
        style: {
          textAlign: "center"
        }
      },
      {
        id: "leaveStatus",
        Header: "Leave Status",
        accessor: str => showFullStatus(str.leaveStatus),
        minWidth: 140,
        sortable: true,
        filterable: true
      },
      {
        id: "Action",
        Header: "Action",
        accessor: viewButton => (
          <Button
            color="primary"
            size="sm"
            tag={Link}
            to={`/leavehistory/view/${viewButton.id.emplid}/${formatDateYMD(
              viewButton.id.effDate
            )}/${formatDateYMD(viewButton.id.startDate)}/${
              viewButton.id.leaveCode
            }`}
            activeclassname="active"
            className="smallButtonOverride"
          >
            <span className="fa fa-folder-open" style={{ color: "white" }} />
            &nbsp;View
          </Button>
        ),
        minWidth: 90,
        sortable: false,
        filterable: false,
        style: {
          textAlign: "center"
        }
      }
    ];

    return (
      <div className="mainContainerFlex">
        <div className="headerContainerFlex">
          <span className="header">
            <h3 className="headerStyle">Leave History</h3>
          </span>
        </div>
        <div className="reactTableContainer">
          <div className="mainListBtnContainer">
            <div className="SubListBtnSingleContainer">
              <ExportToExcel leaveHistoryData={this.state.leaveHistoryData} />
            </div>
          </div>
          <ReactTable
            data={this.state.leaveHistoryData}
            columns={leaveHistoryCols}
            defaultPageSize={10}
            pages={this.state.pages}
            loading={this.state.loading}
            filterable={true}
            sortable={true}
            multiSort={true}
            // rowsText="Rows per page"
            loadingText="Loading Employee Leave History..."
            noDataText="No data available."
            className="-striped"
          />
        </div>
      </div>
    );
  }
}

export default withRouter(LeaveHistoryList);
