// Minimal dashboard logic to initialize charts and tables placeholder
window.initDashboard = async function () {
  // Fetch live dashboard data
  if (typeof SGD !== "undefined" && SGD.api) {
    try {
      SGD.showLoading();
      const res = await SGD.api("getDashboardData");
      console.log("Dashboard API Response:", res);
      if (res && res.data) {
        const d = res.data;
        document.getElementById("kpiTodaySales").textContent =
          `${SGD.formatCurrency(d.todaySales || 0)}`;
        document.getElementById("kpiMonthSales").textContent =
          `${SGD.formatCurrency(d.monthSales || 0)}`;
        document.getElementById("kpiReceivable").textContent =
          `${SGD.formatCurrency(d.totalReceivables || 0)}`;
        document.getElementById("kpiPayable").textContent =
          `${SGD.formatCurrency(d.totalPayables || 0)}`;

        // Dynamic Charts
        if (res.data.chartData) {
          const cData = res.data.chartData;
          const ctx1 = document.getElementById("salesPurchaseChart");
          if (ctx1) {
            new Chart(ctx1, {
              type: "bar",
              data: {
                labels: cData.months,
                datasets: [
                  {
                    label: "Sales",
                    data: cData.sales,
                    backgroundColor: "rgba(17, 153, 142, 0.85)",
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                  {
                    label: "Purchases",
                    data: cData.purchases,
                    backgroundColor: "rgba(102, 126, 234, 0.85)",
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { usePointStyle: true, padding: 15 },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => "₹" + v / 1000 + "K" },
                    grid: { color: "rgba(0,0,0,0.05)" },
                  },
                  x: { grid: { display: false } },
                },
              },
            });
          }

          const ctx2 = document.getElementById("topItemsChart");
          if (ctx2) {
            new Chart(ctx2, {
              type: "doughnut",
              data: {
                labels: cData.topItems.labels,
                datasets: [
                  {
                    data: cData.topItems.data,
                    backgroundColor: [
                      "#667eea",
                      "#11998e",
                      "#f7971e",
                      "#eb3349",
                      "#2193b0",
                    ],
                    borderWidth: 0,
                    hoverOffset: 8,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "60%",
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 12,
                      font: { size: 11 },
                    },
                  },
                },
              },
            });
          }
        }

        // Populate recent sales
        const salesTbody = document.getElementById("recentSalesTableBody");
        salesTbody.innerHTML = "";
        const recentSales = res.data.recentSales || [];
        if (recentSales.length === 0) {
          salesTbody.innerHTML =
            '<tr><td colspan="5" class="text-center text-muted">No recent sales</td></tr>';
        } else {
          recentSales.slice(0, 5).forEach((s) => {
            const paymentStatus = s.PaymentStatus || s.Status || "Unpaid";
            let statusBadge =
              paymentStatus === "Paid"
                ? "bg-success"
                : paymentStatus === "Unpaid"
                  ? "bg-danger"
                  : "bg-warning text-dark";
            let dateStr = SGD.formatDate(s.InvoiceDate || s.date || "");
            salesTbody.innerHTML += `
                  <tr>
                    <td>${s.InvoiceID || s.InvoiceNo || "-"}</td>
                    <td>${dateStr}</td>
                    <td>${s.PartyName || "-"}</td>
                    <td class="text-end fw-medium">${SGD.formatCurrency(s.TotalAmount || s.GrandTotal || 0)}</td>
                    <td class="text-center"><span class="badge ${statusBadge}">${paymentStatus}</span></td>
                  </tr>
                `;
          });
        }

        // Populate low stock
        const lowStockTbody = document.getElementById("lowStockTableBody");
        if (lowStockTbody) {
          lowStockTbody.innerHTML = "";
          const lowStockItems = res.data.lowStockItems || [];
          if (lowStockItems.length === 0) {
            lowStockTbody.innerHTML =
              '<tr><td colspan="4" class="text-center text-muted">No low stock items</td></tr>';
          } else {
            lowStockItems.forEach((i) => {
              lowStockTbody.innerHTML += `
                        <tr>
                            <td>${i.ItemName || "-"}</td>
                            <td class="text-end fw-bold text-danger">${i.CurrentStock || 0}</td>
                            <td class="text-end">${i.MinStock || 0}</td>
                            <td class="text-center"><span class="badge bg-danger">Low Stock</span></td>
                        </tr>
                        `;
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
      SGD.showToast(
        "Failed to load live dashboard data. Please check backend connection.",
        "danger",
      );
    } finally {
      SGD.hideLoading();
    }
  }
};
