import React, { useEffect, useState } from 'react'
import Plot from 'react-plotly.js';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import './HomeDashboard.css'
import { useAuth } from '../../../../utils/AuthenticationUtils';
export default function HomeDashboard() {
  // data
  const { user } = useAuth()
  const months = 31
  const generateData = () => Array.from({ length: months }, () => Math.floor(Math.random() * 70) + 10);
  const [userCreated, setUserCreated] = useState(generateData());
  const label = (['Artist', 'Quảng cáo', 'Prenium user', 'Hợp đồng Artist', 'Khác'])
  const colorMap = {
    'Artist': '#FF4136',
    'Quảng cáo': '#2ECC40',
    'Prenium user': '#0074D9',
    'Hợp đồng Artist': '#FF851B',
    'Khác': '#B10DC9'
  };

  //set value
  const [revenue, setRevenue] = useState(
    Object.fromEntries(label.map(item => [item, generateData()]))
  );
  const [streamingBandwith, setStreamingBandwith] = useState(generateData())

  const days = Array.from({ length: months }, (_, i) => `${i + 1}`);
  const totalMoney = Object.fromEntries(
    Object.entries(revenue).map(([label, arr]) => {
      const sum = arr.reduce((acc, v) => acc + v, 0);
      return [label, sum];
    })
  );
  const totalUserCreated = userCreated.reduce((a, b) => a + b, 0);

  const dailyRevenue = Array.from({ length: months }, (_, i) =>
    label.reduce((sum, label) => sum + revenue[label][i], 0))
  const trace = Object.entries(revenue).map(([label, value]) => ({
    x: days,
    y: value,
    name: label,
    type: 'bar',
    marker: { color: colorMap[label] }
  }))

  // trung bình 
  const avgRevenue = dailyRevenue.reduce((a, b) => a + b, 0) / months;
  const avgLine = Array(months).fill(avgRevenue);
  const avgStreamingBandwith = streamingBandwith.reduce((a, b) => a + b, 0)

  return (
    user && (
      <div className='homedb-container'>
        <div className="homedb-header-container">
          <h3 className="titledb">DASHBOARD - HOME</h3>
          <label htmlFor='searchdb' className="search-container">
            <SearchOutlinedIcon />
            <input type="text" id="searchdb" placeholder='Search for tools & features...' />
          </label>
          <span><NotificationsNoneIcon /></span>
        </div>
        <div className="revenue-container">
          <div className="circle-revenue">
            <Plot
              data={[{
                labels: Object.keys(totalMoney),
                values: Object.values(totalMoney),
                type: 'pie',
                marker: { colors: ['#FF4136', '#2ECC40', '#0074D9', '#FF851B', '#B10DC9'] },
                hoverinfo: 'label+percent',
                textinfo: 'label+percent',
                textfont: {
                  color: 'white',
                  size: 14
                }
              }]}
              layout={{
                title: {
                  text: 'Doanh thu',
                  font: {
                    color: 'white'
                  }
                },
                font: {
                  color: 'white'
                },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                showlegend: true
              }}
              config={{
                displayModeBar: true,
                modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
                displaylogo: false
              }}
            />
          </div>
          <div className="linebar-revenue">
            <Plot
              data={[
                ...trace,
                {
                  x: days,
                  y: avgLine,
                  type: 'scatter',
                  mode: 'lines',
                  name: `Trung bình ngày: ${avgRevenue.toFixed(0)} USA`,
                  line: {
                    color: '#eee',
                    width: 3,
                    dash: 'dot'
                  }
                }
              ]}
              layout={{
                title: {
                  text: 'Doanh thu tháng 1',
                  font: { color: 'white' }
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: 'white' },
                xaxis: { title: { text: 'Ngày', color: 'white', size: 16 }, type: 'category', },
                yaxis: { title: { text: 'Doanh thu (USA)', color: 'white', size: 16 } },
                barmode: 'stack'
              }}
              config={{ displayModeBar: false }}
            />
          </div>
          <div className="line-streaming">
            <Plot
              data={[
                {
                  x: days,
                  y: streamingBandwith,
                  type: 'scatter',
                  mode: 'lines',
                  name: `Số lượng stream nhạc trong tháng 1: ${avgStreamingBandwith}`,
                  line: {
                    color: '#FF4136',
                    width: 3,
                    dash: 'solid'
                  }
                }
              ]}
              layout={{
                title: {
                  text: 'Doanh thu tháng 1',
                  font: { color: 'white', size: 16 }
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: 'white' },
                xaxis: { type: 'category', title: { text: 'Ngày', color: 'white', size: 16 } },
                yaxis: { title: { text: 'Số lượng', color: 'white', size: 16 } },
                showlegend: true
              }}
              config={{ displayModeBar: false }}
            />
          </div>
          {user?.role == 'admin' ? (<div className="user-created-chart">
            <Plot
              data={[
                {
                  x: days,
                  y: userCreated,
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: `Tổng user tạo mới: ${totalUserCreated}`,
                  line: {
                    color: '#2ECC40',
                    width: 3
                  },
                  marker: {
                    size: 6
                  }
                }
              ]}
              layout={{
                title: {
                  text: 'User tạo mới trong tháng',
                  font: { color: 'white', size: 16 }
                },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: 'white' },
                xaxis: { type: 'category', title: { text: 'Ngày', color: 'white', size: 16 } },
                yaxis: { title: { text: 'Số lượng user', color: 'white', size: 16 } },
                showlegend: true
              }}
              config={{ displayModeBar: false }}
            />
          </div>) : ''}
        </div>
      </div>
    )
  )
}
