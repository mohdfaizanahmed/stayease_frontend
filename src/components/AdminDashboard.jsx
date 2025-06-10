import { useEffect, useState } from "react";
import LineChart from "../ChartsAndGraphs/LineChart";
import InfoContainer from "../components/InfoContainer";
import API from "../api/axios";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [showResidents, setShowResidents] = useState(false);
  const [residentData, setResidentData] = useState([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Dashboard Data:", dashboardData);
  }, [dashboardData]);
  useEffect(() => {
    console.log("Revenue Data:", revenueData);
    console.log("Expenses Data:", expensesData);
  }, [revenueData, expensesData]);
  useEffect(() => {
    console.log("Residents Data:", residentData);
  }, [residentData]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, assignmentsResponse] = await Promise.all([
          API.get("/dashboard"),
          API.get("/getAllAssignedRooms"),
        ]);
        console.log("Dashboard API Response:", dashboardResponse.data);
        console.log("Assignments API Response:", assignmentsResponse.data);

        setDashboardData(dashboardResponse.data);
        setRevenueData(dashboardResponse.data.revenueData?.reveData || []);
        setExpensesData(dashboardResponse.data.expensesData?.expenseData || []);

        // Map residents to room numbers
        const residents = dashboardResponse.data.residentData?.residents || [];
        const assignments = assignmentsResponse.data.roomAssignments || [];

        const residentDataWithRooms = residents.map((resident) => {
          const assignment = assignments.find(
            (a) => a.residentId.toString() === resident._id.toString()
          );
          return {
            username: resident.username || "Unknown",
            residentId: resident._id,
            roomNumber: assignment
              ? assignment.roomId.roomNumber 
              : "Not Assigned",
          };
        });
        console.log("Resident Data with Rooms:", residentDataWithRooms);
        setResidentData(residentDataWithRooms);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        setError("Failed to load dashboard data. Please try again.");
        setDashboardData({});
        setResidentData([]);
      }
    };
    fetchDashboardData();
  }, []);

  const toggleResidents = () => {
    setShowResidents(!showResidents);
  };

  const toggleExpenses = () => {
    setShowExpenses(!showExpenses);
  };

  return (
    <>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      {dashboardData ? (
        <div>
          <section className="flex gap-4">
            <div className="shadow-lg p-10">
              <LineChart revenueData={revenueData} expensesData={expensesData} />
            </div>
            <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-white">
                  Staff Members
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    {dashboardData.staffData?.staffNames?.length || 0} Active
                  </span>
                  <button
                    onClick={toggleResidents}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View Residents
                  </button>
                  <button
                    onClick={toggleExpenses}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2"
                  >
                    View Expenses
                  </button>
                </div>
              </div>
              <hr className="mb-6 border-gray-700" />
              <div className="space-y-4">
                {dashboardData.staffData?.staffNames?.length > 0 ? (
                  dashboardData.staffData.staffNames.map((name, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
                          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
                          {name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{name || "Unknown"}</h3>
                          <p className="text-sm text-gray-300">Staff Member</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300">No staff members available</p>
                )}
              </div>
            </div>
          </section>

         {/* Residents Dialog */}
{showResidents && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
      <button
        onClick={toggleResidents}
        className="absolute top-4 right-4 text-gray-300 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-white">
          Residents
        </h1>
        <span className="text-sm text-gray-300">
          {residentData.length || 0} Active
        </span>
      </div>
      <hr className="mb-6 border-gray-700" />
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {residentData.length > 0 ? (
          residentData.map((resident, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
                  {resident.username?.charAt(0) || "?"}
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {resident.username || "Unknown"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Room:</span>
                    {resident.roomNumber !== "Not Assigned" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-100">
                        {resident.roomNumber}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-600 text-gray-300">
                        Not Assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No residents available</p>
        )}
      </div>
    </div>
  </div>
)}

          {/* Expenses Dialog */}
          {showExpenses && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
                <button
                  onClick={toggleExpenses}
                  className="absolute top-4 right-4 text-gray-300 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-semibold text-white">Expenses</h1>
                  <span className="text-sm text-gray-300">
                    {dashboardData.expensesData?.expenses?.length || 0} Categories
                  </span>
                </div>
                <hr className="mb-6 border-gray-700" />
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {dashboardData.expensesData?.expenses?.length > 0 ? (
                    dashboardData.expensesData.expenses.map((expense, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
                            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
                            {expense._id?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">
                              {expense._id || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-300">Category</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
                            ${expense.totalAmount || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300">No expenses available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <hr className="mt-10" />
          <section className="flex flex-col gap-1 w-fit items-center">
            <div className="flex mt-4">
              <InfoContainer
                value={dashboardData.roomData?.netWorth || 0}
                title={"Net Profit"}
                icon={
                  <span className="absolute right-0 bottom-10 opacity-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                }
              />
              <InfoContainer
                value={dashboardData.expensesData?.totalExpenses || 0}
                title={"Expense"}
                icon={
                  <span className="absolute right-0 bottom-10 opacity-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                }
              />
              <InfoContainer
                color="blue"
                value={dashboardData.revenueData?.totalRevenue || 0}
                title={"Revenue"}
                icon={
                  <span className="absolute right-0 bottom-10 opacity-20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-20"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 p-4">
              <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 30"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 text-blue-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        Room Statistics
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">Total Rooms</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData.roomData?.totalRooms || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">Occupied Rooms</p>
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData.roomData?.occupiedRooms || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">Available Rooms</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboardData.roomData?.availableRooms || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">Active Assignments</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {dashboardData.roomData?.activeAssignments || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">
                        InActive Assignments
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {dashboardData.roomData?.inActiveAssignments || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* <BarChart/> */}
        </div>
      ) : (
        <p className="text-gray-300">Loading dashboard data...</p>
      )}
    </>
  );
}

export default AdminDashboard;













































































































// import React, { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";
// import BarChart from "../ChartsAndGraphs/BarChart";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);

//   useEffect(() => {
//     console.log(dashboardData);
//   }, [dashboardData]);
//   useEffect(()=>{
//     console.log(revenueData);
//     console.log(expensesData)    
//   },[revenueData,expensesData])

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data); // Check if revenueData is present
  
//         setDashboardData(response.data);
//         setRevenueData(response.data.revenueData.reveData);

//         // setRevenueData(response.data.revenueData.reveData); // Ensure response contains reveData
//         setExpensesData(response.data.expensesData.expenseData);
//       } catch (error) {
//         console.log("Error fetching dashboard data:", error);
//       }
//     };
//     fetchDashboardData();
//   }, []);
  

//   return (
//     <>
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <span className="text-sm text-gray-300">
//                   {dashboardData.staffData.staffNames.length} Active
//                 </span>
//               </div>
//               <hr className="mb-6 border-gray-700" />
//               <div className="space-y-4">
//                 {dashboardData.staffData.staffNames.map((name, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                         <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                         {name.charAt(0)}
//                       </div>
//                       <div>
//                         <h3 className="text-white font-medium">{name}</h3>
//                         <p className="text-sm text-gray-300">Staff Member</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                         <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                         Active
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>
//           <hr className="mt-10" />
//           <section className="flex  flex-col gap-1 w-fit">
//             <div className="flex mt-1">
//               <InfoContainer
//                 value={dashboardData.roomData.netWorth}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData.totalExpenses}
//                 title={"Expense"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color={"blue"}
//                 value={dashboardData.revenueData.totalRevenue}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />{" "}
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-blue-600">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">Room Statistics</p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">{dashboardData.roomData.totalRooms}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">{dashboardData.roomData.occupiedRooms}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">{dashboardData.roomData.availableRooms}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">{dashboardData.roomData.activeAssignments}</p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">InActive Assignments</p>
//                       <p className="text-2xl font-bold text-red-600">{dashboardData.roomData.inActiveAssignments}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>          </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : null}
//     </>
//   );
// }

// export default AdminDashboard;


// import React, { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";
// import BarChart from "../ChartsAndGraphs/BarChart";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);
//   const [showResidents, setShowResidents] = useState(false);
//   const [residentsData, setResidentsData] = useState([]);

//   useEffect(() => {
//     console.log(dashboardData);
//   }, [dashboardData]);
//   useEffect(() => {
//     console.log(revenueData);
//     console.log(expensesData);
//   }, [revenueData, expensesData]);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data);

//         setDashboardData(response.data);
//         console.log(response.data);
//         setRevenueData(response.data.revenueData.reveData);
//         setExpensesData(response.data.expensesData.expenseData);

//         // Fetch residents data
//         const residentsResponse = await API.get("/resident");
//         setResidentsData(residentsResponse.data);
//       } catch (error) {
//         console.log("Error fetching dashboard data:", error);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const toggleResidents = () => {
//     setShowResidents(!showResidents);
//   };

//   return (
//     <>
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.staffData.staffNames.length} Active
//                   </span>
//                   <button
//                     onClick={toggleResidents}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                   >
//                     View Residents
//                   </button>
//                 </div>
//               </div>
//               <hr className="mb-6 border-gray-700" />
//               <div className="space-y-4">
//                 {dashboardData.staffData.staffNames.map((name, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                         <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                         {name.charAt(0)}
//                       </div>
//                       <div>
//                         <h3 className="text-white font-medium">{name}</h3>
//                         <p className="text-sm text-gray-300">Staff Member</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                         <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                         Active
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           {/* Residents Dialog */}
//           {showResidents && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleResidents}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">
//                     Residents
//                   </h1>
//                   <span className="text-sm text-gray-300">
//                     {residentsData.length} Active
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {residentsData.map((resident, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                           <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                           {resident.name.charAt(0)}
//                         </div>
//                         <div>
//                           <h3 className="text-white font-medium">
//                             {resident.name}
//                           </h3>
//                           <p className="text-sm text-gray-300">
//                             Room: {resident.roomNumber}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                           {resident.status}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr className="mt-10" />
//           <section className="flex  flex-col gap-1 w-fit">
//             <div className="flex mt-1">
//               <InfoContainer
//                 value={dashboardData.roomData.netWorth}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData.totalExpenses}
//                 title={"Expense"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color={"blue"}
//                 value={dashboardData.revenueData.totalRevenue}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />{" "}
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth="1.5"
//                         stroke="currentColor"
//                         className="w-6 h-6 text-blue-600"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">
//                         Room Statistics
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">
//                         {dashboardData.roomData.totalRooms}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">
//                         {dashboardData.roomData.occupiedRooms}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">
//                         {dashboardData.roomData.availableRooms}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">
//                         {dashboardData.roomData.activeAssignments}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">
//                         InActive Assignments
//                       </p>
//                       <p className="text-2xl font-bold text-red-600">
//                         {dashboardData.roomData.inActiveAssignments}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>{" "}
//           </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : null}
//     </>
//   );
// }

// export default AdminDashboard;

// import React, { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";
// import BarChart from "../ChartsAndGraphs/BarChart";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);
//   const [showResidents, setShowResidents] = useState(false);
//   const [residentData, setResidentData] = useState([]);
//   const [error, setError] = useState(null); // Track API or rendering errors

//   useEffect(() => {
//     console.log("Dashboard Data:", dashboardData);
//   }, [dashboardData]);
//   useEffect(() => {
//     console.log("Revenue Data:", revenueData);
//     console.log("Expenses Data:", expensesData);
//   }, [revenueData, expensesData]);
//   useEffect(() => {
//     console.log("Residents Data:", residentData);
//   }, [residentData]);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data);

//         setDashboardData(response.data);
//         setRevenueData(response.data.revenueData?.reveData || []);
//         setExpensesData(response.data.expensesData?.expenseData || []);

//         // Set residents data, default to empty array if not available
//         const residentNames = response.data.residentData.residentNames;
//         setResidentData(residentNames);
//       } catch (error) {
//         console.log("Error fetching dashboard data:", error);
//         setError("Failed to load dashboard data. Please try again.");
//         // Set defaults to prevent blank screen
//         setDashboardData({});
//         setResidentData([]);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const toggleResidents = () => {
//     setShowResidents(!showResidents);
//   };

//   return (
//     <>
//       {error && (
//         <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
//           {error}
//         </div>
//       )}
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.staffData?.staffNames?.length || 0} Active
//                   </span>
//                   <button
//                     onClick={toggleResidents}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                   >
//                     View Residents
//                   </button>
//                 </div>
//               </div>
//               <hr className="mb-6 border-gray-700" />


//               <div className="space-y-4">
//                 {dashboardData.staffData?.staffNames?.map((name, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                         <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                         {name?.charAt(0) || "?"}
//                       </div>
//                       <div>
//                         <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                         <p className="text-sm text-gray-300">Staff Member</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                         <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                         Active
//                       </span>
//                     </div>
//                   </div>
//                 )) || (
//                   <p className="text-gray-300">No staff members available</p>
//                 )}
//               </div>


//               <div className="space-y-4">
//                 {dashboardData.residentData?.residentNames?.map((name, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                         <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                         {name?.charAt(0) || "?"}
//                       </div>
//                       <div>
//                         <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                         <p className="text-sm text-gray-300">Resident Member</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                         <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                         Active
//                       </span>
//                     </div>
//                   </div>
//                 )) || (
//                   <p className="text-gray-300">No Residents available</p>
//                 )}
//               </div>



//             </div>



            



//           </section>

//           {/* Residents Dialog */}
//           {showResidents && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleResidents}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">
//                     Residents
//                   </h1>
//                   <span className="text-sm text-gray-300">
//                     {residentData.length || 0} Active
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {residentData.length > 0 ? (
//                     residentData.map((name, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                             <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                             {name?.charAt(0) || "?"}
//                           </div>
//                           <div>
//                             <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                             <p className="text-sm text-gray-300">Resident</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                             Active
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-300">No residents available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr className="mt-10" />
//           <section className="flex flex-col gap-1 w-fit">
//             <div className="flex mt-1">
//               <InfoContainer
//                 value={dashboardData.roomData?.netWorth || 0}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData?.totalExpenses || 0}
//                 title={"Expense"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color={"blue"}
//                 value={dashboardData.revenueData?.totalRevenue || 0}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth="1.5"
//                         stroke="currentColor"
//                         className="w-6 h-6 text-blue-600"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">
//                         Room Statistics
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">
//                         {dashboardData.roomData?.totalRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">
//                         {dashboardData.roomData?.occupiedRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">
//                         {dashboardData.roomData?.availableRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">
//                         {dashboardData.roomData?.activeAssignments || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">
//                         InActive Assignments
//                       </p>
//                       <p className="text-2xl font-bold text-red-600">
//                         {dashboardData.roomData?.inActiveAssignments || 0}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : (
//         <p className="text-gray-300">Loading dashboard data...</p>
//       )}
//     </>
//   );
// }

// export default AdminDashboard;



// import React, { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";
// import BarChart from "../ChartsAndGraphs/BarChart";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);
//   const [showResidents, setShowResidents] = useState(false);
  
//   const [error, setError] = useState(null);
  

//   useEffect(() => {
//     console.log("Dashboard Data:", dashboardData);
//   }, [dashboardData]);
  
//   useEffect(() => {
//     console.log("Revenue Data:", revenueData);
//     console.log("Expenses Data:", expensesData);
//   }, [revenueData, expensesData]);
 

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data);
//         // console.log("Resident Data in Response:", response.data.residentData);

//         setDashboardData(response.data);
//         setRevenueData(response.data.revenueData?.reveData || []);
//         setExpensesData(response.data.expensesData?.expenseData || []);

//         // Safely set resident data
        
        
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error.message);
//         setError("Failed to load dashboard data. Please try again.");
//         setDashboardData({});
        
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const toggleResidents = () => {
//     setShowResidents(!showResidents);
//   };

//   return (
//     <>
//       {error && (
//         <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
//           {error}
//         </div>
//       )}
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.staffData?.staffNames?.length || 0} Active
//                   </span>
//                   <button
//                     onClick={toggleResidents}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                   >
//                     View Residents
//                   </button>
//                 </div>
//               </div>
//               <hr className="mb-6 border-gray-700" />
//               <div className="space-y-4">
//                 {dashboardData.staffData?.staffNames?.length > 0 ? (
//                   dashboardData.staffData.staffNames.map((name, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                           <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                           {name?.charAt(0) || "?"}
//                         </div>
//                         <div>
//                           <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                           <p className="text-sm text-gray-300">Staff Member</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                           Active
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-300">No staff members available</p>
//                 )}
//               </div>

                

//             </div>
//           </section>

//           {/* Residents Dialog */}
//           {showResidents && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleResidents}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">
//                     Residents
//                   </h1>
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.residentData?.residentNames?.length  || 0} Active
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {dashboardData.residentData?.residentNames?.length > 0 ? (
//                      dashboardData.residentData.residentNames.map((name, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                             <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                             {name?.charAt(0) || "?"}
//                           </div>
//                           <div>
//                             <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                             <p className="text-sm text-gray-300">Resident</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                             Active
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-300">No residents available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr className="mt-10" />
//           <section className="flex flex-col gap-1 w-fit">
//             <div className="flex mt-1">
//               <InfoContainer
//                 value={dashboardData.roomData?.netWorth || 0}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0.0 24 24"
//                     >
//                       <path
//                         stroke="http://www.w3.org/2000/svg"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="1.0"
//                         d="M12 6v12m-3-2.81c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData?.totalExpenses || 0}
//                 title={"Expense"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12-.725 0 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color="blue"
//                 value={dashboardData.revenueData?.totalRevenue || 0}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth="1.5"
//                         stroke="currentColor"
//                         className="w-6 h-6 text-blue-600"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">
//                         Room Statistics
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">
//                         {dashboardData.roomData?.totalRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">
//                         {dashboardData.roomData?.occupiedRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">
//                         {dashboardData.roomData?.availableRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">
//                         {dashboardData.roomData?.activeAssignments || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">
//                         InActive Assignments
//                       </p>
//                       <p className="text-2xl font-bold text-red-600">
//                         {dashboardData.roomData?.inActiveAssignments || 0}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : (
//         <p className="text-gray-300">Loading dashboard data...</p>
//       )}
//     </>
//   );
// }

// export default AdminDashboard;



// import { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);
//   const [showResidents, setShowResidents] = useState(false);
//   const [residentData, setResidentData] = useState([]); // Store resident usernames
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     console.log("Dashboard Data:", dashboardData);
//   }, [dashboardData]);
//   useEffect(() => {
//     console.log("Revenue Data:", revenueData);
//     console.log("Expenses Data:", expensesData);
//   }, [revenueData, expensesData]);
//   useEffect(() => {
//     console.log("Residents Data:", residentData);
//   }, [residentData]);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data);
//         console.log("Resident Data in Response:", response.data.residentData);

//         setDashboardData(response.data);
//         setRevenueData(response.data.revenueData?.reveData || []);
//         setExpensesData(response.data.expensesData?.expenseData || []);

//         // Set resident data from residents array
//         const residents = response.data.residentData?.residents || [];
//         const residentNames = Array.isArray(residents)
//           ? residents.map((resident) => resident.username || "Unknown")
//           : [];
//         console.log("Resident Names:", residentNames);
//         setResidentData(residentNames);
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error.message);
//         setError("Failed to load dashboard data. Please try again.");
//         setDashboardData({});
//         setResidentData([]);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const toggleResidents = () => {
//     setShowResidents(!showResidents);
//   };

//   return (
//     <>
//       {error && (
//         <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
//           {error}
//         </div>
//       )}
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.staffData?.staffNames?.length || 0} Active
//                   </span>
//                   <button
//                     onClick={toggleResidents}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                   >
//                     View Residents
//                   </button>
//                 </div>
//               </div>
//               <hr className="mb-6 border-gray-700" />
//               <div className="space-y-4">
//                 {dashboardData.staffData?.staffNames?.length > 0 ? (
//                   dashboardData.staffData.staffNames.map((name, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                           <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                           {name?.charAt(0) || "?"}
//                         </div>
//                         <div>
//                           <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                           <p className="text-sm text-gray-300">Staff Member</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                           Active
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-300">No staff members available</p>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* Residents Dialog */}
//           {showResidents && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleResidents}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">
//                     Residents
//                   </h1>
//                   <span className="text-sm text-gray-300">
//                     {residentData.length || 0} Active
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {residentData.length > 0 ? (
//                     residentData.map((name, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                             <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                             {name?.charAt(0) || "?"}
//                           </div>
//                           <div>
//                             <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                             <p className="text-sm text-gray-300">Resident</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                             Active
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-300">No residents available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr className="mt-10" />
//           <section className="flex flex-col gap-1 w-fit items-center">
//             <div className="flex mt-4">
//               <InfoContainer
//                 value={dashboardData.roomData?.netWorth || 0}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 3v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData?.totalExpenses || 0}
//                 title={"Expense"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color="blue"
//                 value={dashboardData.revenueData?.totalRevenue || 0}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth="1.5"
//                         stroke="currentColor"
//                         className="w-6 h-6 text-blue-600"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">
//                         Room Statistics
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">
//                         {dashboardData.roomData?.totalRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">
//                         {dashboardData.roomData?.occupiedRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">
//                         {dashboardData.roomData?.availableRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">
//                         {dashboardData.roomData?.activeAssignments || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">
//                         InActive Assignments
//                       </p>
//                       <p className="text-2xl font-bold text-red-600">
//                         {dashboardData.roomData?.inActiveAssignments || 0}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : (
//         <p className="text-gray-300">Loading dashboard data...</p>
//       )}
//     </>
//   );
// }

// export default AdminDashboard;




// import { useEffect, useState } from "react";
// import LineChart from "../ChartsAndGraphs/LineChart";
// import InfoContainer from "../components/InfoContainer";
// import API from "../api/axios";

// function AdminDashboard() {
//   const [dashboardData, setDashboardData] = useState(false);
//   const [revenueData, setRevenueData] = useState([]);
//   const [expensesData, setExpensesData] = useState([]);
//   const [showResidents, setShowResidents] = useState(false);
//   const [residentData, setResidentData] = useState([]);
//   const [showExpenses, setShowExpenses] = useState(false); // Toggle expenses modal
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     console.log("Dashboard Data:", dashboardData);
//   }, [dashboardData]);
//   useEffect(() => {
//     console.log("Revenue Data:", revenueData);
//     console.log("Expenses Data:", expensesData);
//   }, [revenueData, expensesData]);
//   useEffect(() => {
//     console.log("Residents Data:", residentData);
//   }, [residentData]);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const response = await API.get("/dashboard");
//         console.log("API Response:", response.data);
//         console.log("Resident Data in Response:", response.data.residentData);

//         setDashboardData(response.data);
//         setRevenueData(response.data.revenueData?.reveData || []);
//         setExpensesData(response.data.expensesData?.expenseData || []);

//         // Set resident data from residents array
//         const residents = response.data.residentData?.residents || [];
//         const residentNames = Array.isArray(residents)
//           ? residents.map((resident) => resident.username || "Unknown")
//           : [];
//         console.log("Resident Names:", residentNames);
//         setResidentData(residentNames);
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error.message);
//         setError("Failed to load dashboard data. Please try again.");
//         setDashboardData({});
//         setResidentData([]);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const toggleResidents = () => {
//     setShowResidents(!showResidents);
//   };

//   const toggleExpenses = () => {
//     setShowExpenses(!showExpenses);
//   };

//   return (
//     <>
//       {error && (
//         <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
//           {error}
//         </div>
//       )}
//       {dashboardData ? (
//         <div>
//           <section className="flex gap-4">
//             <div className="shadow-lg p-10">
//               <LineChart revenueData={revenueData} expensesData={expensesData} />
//             </div>
//             <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-2xl font-semibold text-white">
//                   Staff Members
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.staffData?.staffNames?.length || 0} Active
//                   </span>
//                   <button
//                     onClick={toggleResidents}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
//                   >
//                     View Residents
//                   </button>
//                    <button
//                     onClick={toggleExpenses}
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2"
//                   >
//                     View Expenses
//                   </button>
//                 </div>
//               </div>
//               <hr className="mb-6 border-gray-700" />
//               <div className="space-y-4">
//                 {dashboardData.staffData?.staffNames?.length > 0 ? (
//                   dashboardData.staffData.staffNames.map((name, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                     >
//                       <div className="flex items-center space-x-4">
//                         <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                           <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                           {name?.charAt(0) || "?"}
//                         </div>
//                         <div>
//                           <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                           <p className="text-sm text-gray-300">Staff Member</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center">
//                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                           <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                           Active
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-300">No staff members available</p>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* Residents Dialog */}
//           {showResidents && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleResidents}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">
//                     Residents
//                   </h1>
//                   <span className="text-sm text-gray-300">
//                     {residentData.length || 0} Active
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {residentData.length > 0 ? (
//                     residentData.map((name, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                             <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                             {name?.charAt(0) || "?"}
//                           </div>
//                           <div>
//                             <h3 className="text-white font-medium">{name || "Unknown"}</h3>
//                             <p className="text-sm text-gray-300">Resident</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                             <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
//                             Active
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-300">No residents available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Expenses Dialog */}
//           {showExpenses && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//               <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg p-6 relative">
//                 <button
//                   onClick={toggleExpenses}
//                   className="absolute top-4 right-4 text-gray-300 hover:text-white"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>

//                 <div className="flex justify-between items-center mb-4">
//                   <h1 className="text-2xl font-semibold text-white">Expenses</h1>
//                   <span className="text-sm text-gray-300">
//                     {dashboardData.expensesData?.expenses?.length || 0} Categories
//                   </span>
//                 </div>
//                 <hr className="mb-6 border-gray-700" />
//                 <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                   {dashboardData.expensesData?.expenses?.length > 0 ? (
//                     dashboardData.expensesData.expenses.map((expense, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md border border-gray-600"
//                       >
//                         <div className="flex items-center space-x-4">
//                           <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold shadow-md relative">
//                             <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20"></span>
//                             {expense._id?.charAt(0)?.toUpperCase() || "?"}
//                           </div>
//                           <div>
//                             <h3 className="text-white font-medium">
//                               {expense._id || "Unknown"}
//                             </h3>
//                             <p className="text-sm text-gray-300">Category</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center">
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-900 text-white border border-gray-600">
//                             ${expense.totalAmount || 0}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-gray-300">No expenses available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <hr className="mt-10" />
//           <section className="flex flex-col gap-1 w-fit items-center">
//             <div className="flex mt-4">
//               <InfoContainer
//                 value={dashboardData.roomData?.netWorth || 0}
//                 title={"Net Profit"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 value={dashboardData.expensesData?.totalExpenses || 0}
//                 title={"Expense"}
                
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//               <InfoContainer
//                 color="blue"
//                 value={dashboardData.revenueData?.totalRevenue || 0}
//                 title={"Revenue"}
//                 icon={
//                   <span className="absolute right-0 bottom-10 opacity-20">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="size-20"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 6v12m-3-2.818l.879.659c1.171.879 3.071.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </span>
//                 }
//               />
//             </div>
//             <div className="grid grid-cols-1 gap-4 p-4">
//               <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-4">
//                     <div className="bg-blue-100 p-3 rounded-full">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         strokeWidth="1.5"
//                         stroke="currentColor"
//                         className="w-6 h-6 text-blue-600"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium">
//                         Room Statistics
//                       </p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Total Rooms</p>
//                       <p className="text-2xl font-bold text-blue-600">
//                         {dashboardData.roomData?.totalRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Occupied Rooms</p>
//                       <p className="text-2xl font-bold text-green-600">
//                         {dashboardData.roomData?.occupiedRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Available Rooms</p>
//                       <p className="text-2xl font-bold text-yellow-600">
//                         {dashboardData.roomData?.availableRooms || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">Active Assignments</p>
//                       <p className="text-2xl font-bold text-purple-600">
//                         {dashboardData.roomData?.activeAssignments || 0}
//                       </p>
//                     </div>
//                     <div className="space-y-2">
//                       <p className="text-gray-600 text-sm">
//                         InActive Assignments
//                       </p>
//                       <p className="text-2xl font-bold text-red-600">
//                         {dashboardData.roomData?.inActiveAssignments || 0}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//           {/* <BarChart/> */}
//         </div>
//       ) : (
//         <p className="text-gray-300">Loading dashboard data...</p>
//       )}
//     </>
//   );
// }

// export default AdminDashboard;