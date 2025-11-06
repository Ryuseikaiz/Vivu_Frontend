import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [usersTimeline, setUsersTimeline] = useState([]);
  const [authProviders, setAuthProviders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ recentUsers: [], recentPosts: [] });
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New state for additional stats
  const [aiUsageStats, setAiUsageStats] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [promoCodeStats, setPromoCodeStats] = useState(null);
  const [userAiUsage, setUserAiUsage] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [promoUsers, setPromoUsers] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, currentPage, searchTerm]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [
        overviewRes, 
        timelineRes, 
        providersRes, 
        subscriptionsRes, 
        activityRes,
        aiUsageRes,
        subscriptionDetailsRes,
        promoCodeRes
      ] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats/overview`, config),
        axios.get(`${API_URL}/api/admin/stats/users-timeline`, config),
        axios.get(`${API_URL}/api/admin/stats/auth-providers`, config),
        axios.get(`${API_URL}/api/admin/stats/subscriptions`, config),
        axios.get(`${API_URL}/api/admin/stats/recent-activity`, config),
        axios.get(`${API_URL}/api/admin/stats/ai-usage`, config),
        axios.get(`${API_URL}/api/admin/stats/subscription-details`, config),
        axios.get(`${API_URL}/api/admin/stats/promo-code`, config)
      ]);

      setOverview(overviewRes.data);
      setUsersTimeline(timelineRes.data);
      setAuthProviders(providersRes.data);
      setSubscriptions(subscriptionsRes.data);
      setRecentActivity(activityRes.data);
      setAiUsageStats(aiUsageRes.data);
      setSubscriptionDetails(subscriptionDetailsRes.data);
      setPromoCodeStats(promoCodeRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Lỗi khi tải dữ liệu. Vui lòng đảm bảo bạn có quyền admin.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(
        `${API_URL}/api/admin/users?page=${currentPage}&limit=10&search=${searchTerm}`,
        config
      );

      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${API_URL}/api/admin/users/${userId}`, config);
      alert('Xóa người dùng thành công!');
      fetchUsers();
      fetchAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🎛️ Admin Dashboard</h1>
        <button onClick={fetchAllData} className="refresh-btn">🔄 Làm mới</button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Tổng quan
        </button>
        <button
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          📈 Biểu đồ
        </button>
        <button
          className={`tab ${activeTab === 'ai-usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-usage')}
        >
          🤖 Sử dụng AI
        </button>
        <button
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          💳 Subscriptions
        </button>
        <button
          className={`tab ${activeTab === 'promo-codes' ? 'active' : ''}`}
          onClick={() => setActiveTab('promo-codes')}
        >
          🎫 Mã khuyến mãi
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Người dùng
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          🔔 Hoạt động
        </button>
      </div>

      {activeTab === 'overview' && overview && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Tổng người dùng</h3>
                <p className="stat-number">{overview.totalUsers}</p>
                <span className="stat-label">Người dùng đã đăng ký</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🆕</div>
              <div className="stat-content">
                <h3>Người dùng mới (7 ngày)</h3>
                <p className="stat-number">{overview.newUsers7Days}</p>
                <span className="stat-label">Đăng ký tuần này</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Người dùng mới (30 ngày)</h3>
                <p className="stat-number">{overview.newUsers30Days}</p>
                <span className="stat-label">Đăng ký tháng này</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Người dùng Premium</h3>
                <p className="stat-number">{overview.subscribedUsers}</p>
                <span className="stat-label">{overview.subscriptionRate}% tổng số</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Tổng bài viết</h3>
                <p className="stat-number">{overview.totalPosts}</p>
                <span className="stat-label">Blog posts</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>Mã khuyến mãi</h3>
                <p className="stat-number">{overview.activePromoCodes}/{overview.totalPromoCodes}</p>
                <span className="stat-label">Đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="charts-section">
          <div className="chart-container">
            <h2>📈 Người dùng mới (30 ngày qua)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usersTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Người dùng mới"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h2>🔐 Phương thức đăng nhập</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={authProviders}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {authProviders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h2>💳 Gói subscription</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Số lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-header">
            <h2>👥 Quản lý người dùng</h2>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">🔍 Tìm</button>
            </form>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Subscription</th>
                  <th>Role</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${user.authProvider}`}>
                        {user.authProvider}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${user.subscription?.isActive ? 'active' : 'inactive'}`}>
                        {user.subscription?.plan || 'free'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="delete-btn"
                        title="Xóa người dùng"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Trước
            </button>
            <span className="pagination-info">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="activity-section">
          <div className="activity-columns">
            <div className="activity-column">
              <h2>🆕 Người dùng mới nhất</h2>
              <div className="activity-list">
                {recentActivity.recentUsers.map(user => (
                  <div key={user._id} className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-content">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <span className="activity-time">
                        {new Date(user.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <span className={`badge badge-${user.authProvider}`}>
                      {user.authProvider}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="activity-column">
              <h2>📝 Bài viết mới nhất</h2>
              <div className="activity-list">
                {recentActivity.recentPosts.map(post => (
                  <div key={post._id} className="activity-item">
                    <div className="activity-icon">📄</div>
                    <div className="activity-content">
                      <h4>{post.title}</h4>
                      <p>Bởi: {post.author?.name || 'Unknown'}</p>
                      <span className="activity-time">
                        {new Date(post.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-usage' && aiUsageStats && (
        <div className="ai-usage-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🔍</div>
              <div className="stat-content">
                <h3>Tổng số tìm kiếm AI</h3>
                <p className="stat-number">{aiUsageStats.totalSearches}</p>
                <span className="stat-label">Tất cả người dùng</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Người dùng hoạt động</h3>
                <p className="stat-number">{aiUsageStats.topUsers.length}</p>
                <span className="stat-label">Đã sử dụng AI</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Trung bình</h3>
                <p className="stat-number">
                  {aiUsageStats.totalSearches > 0 
                    ? (aiUsageStats.totalSearches / aiUsageStats.topUsers.length).toFixed(1)
                    : 0}
                </p>
                <span className="stat-label">Tìm kiếm/người dùng</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h2>🏆 Top 10 người dùng sử dụng AI nhiều nhất</h2>
            <div className="top-users-list">
              {aiUsageStats.topUsers.map((user, index) => (
                <div key={user._id} className="top-user-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="usage-stats">
                    <span className="search-count">{user.usage.searchCount} tìm kiếm</span>
                    {user.usage.lastSearchDate && (
                      <span className="last-search">
                        Lần cuối: {new Date(user.usage.lastSearchDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {aiUsageStats.dailyUsage && aiUsageStats.dailyUsage.length > 0 && (
            <div className="chart-container">
              <h2>📈 Số lượng tìm kiếm AI theo ngày</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aiUsageStats.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="searches" stroke="#8884d8" name="Tìm kiếm" />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Người dùng" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && subscriptionDetails && (
        <div className="subscriptions-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Subscribers đang hoạt động</h3>
                <p className="stat-number">{subscriptionDetails.summary.totalSubscribers}</p>
                <span className="stat-label">Đã đăng ký</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>Sắp hết hạn</h3>
                <p className="stat-number">{subscriptionDetails.summary.expiringCount}</p>
                <span className="stat-label">Trong 7 ngày tới</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Tổng doanh thu</h3>
                <p className="stat-number">
                  {subscriptionDetails.revenueByType.reduce((sum, item) => sum + item.totalRevenue, 0).toLocaleString('vi-VN')} VND
                </p>
                <span className="stat-label">Tất cả subscription</span>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container">
              <h2>📊 Phân bố theo loại subscription</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subscriptionDetails.subscriptionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Tổng số" />
                  <Bar dataKey="active" fill="#82ca9d" name="Đang hoạt động" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h2>💵 Doanh thu theo loại subscription</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionDetails.revenueByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, totalRevenue }) => `${_id}: ${(totalRevenue/1000).toFixed(0)}k`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRevenue"
                  >
                    {subscriptionDetails.revenueByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {subscriptionDetails.expiringSubscriptions.length > 0 && (
            <div className="chart-container">
              <h2>⚠️ Subscriptions sắp hết hạn (7 ngày tới)</h2>
              <div className="expiring-list">
                {subscriptionDetails.expiringSubscriptions.map(user => (
                  <div key={user._id} className="expiring-item">
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="sub-info">
                      <span className={`badge badge-${user.subscription.type}`}>
                        {user.subscription.type}
                      </span>
                      <span className="expiry-date">
                        Hết hạn: {new Date(user.subscription.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'promo-codes' && promoCodeStats && (
        <div className="promo-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>Tổng mã khuyến mãi</h3>
                <p className="stat-number">{promoCodeStats.summary.totalPromoCodes}</p>
                <span className="stat-label">Đã tạo</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Mã đang hoạt động</h3>
                <p className="stat-number">{promoCodeStats.summary.activePromoCodes}</p>
                <span className="stat-label">Có thể sử dụng</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Người dùng dùng mã</h3>
                <p className="stat-number">{promoCodeStats.summary.usersWithPromoCount}</p>
                <span className="stat-label">Đã nhập mã khuyến mãi</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Mã đã sử dụng</h3>
                <p className="stat-number">{promoCodeStats.summary.usedPromoCodes}</p>
                <span className="stat-label">Có người dùng</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h2>🏆 Top 10 mã khuyến mãi được sử dụng nhiều nhất</h2>
            <div className="promo-table-container">
              <table className="promo-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Loại</th>
                    <th>Đã dùng</th>
                    <th>Giới hạn</th>
                    <th>Hết hạn</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodeStats.topPromoCodes.map(promo => (
                    <tr key={promo._id}>
                      <td><strong>{promo.code}</strong></td>
                      <td>
                        <span className={`badge badge-${promo.type}`}>
                          {promo.type} ({promo.duration} tháng)
                        </span>
                      </td>
                      <td>{promo.usedCount}</td>
                      <td>{promo.maxUses || '∞'}</td>
                      <td>
                        {promo.expiresAt 
                          ? new Date(promo.expiresAt).toLocaleDateString('vi-VN')
                          : 'Không giới hạn'
                        }
                      </td>
                      <td>
                        <span className={`badge badge-${promo.isActive ? 'active' : 'inactive'}`}>
                          {promo.isActive ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {promoCodeStats.promoUsageTimeline && promoCodeStats.promoUsageTimeline.length > 0 && (
            <div className="chart-container">
              <h2>📈 Sử dụng mã khuyến mãi theo ngày</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={promoCodeStats.promoUsageTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="_id" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#FF8042" name="Số lượt dùng" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {promoCodeStats.usersWithPromo.length > 0 && (
            <div className="chart-container">
              <h2>👥 Người dùng đã sử dụng mã khuyến mãi</h2>
              <div className="promo-users-list">
                {promoCodeStats.usersWithPromo.slice(0, 20).map(user => (
                  <div key={user._id} className="promo-user-item">
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="promo-info">
                      {user.promoCodes && user.promoCodes.map((promo, idx) => (
                        <div key={idx} className="promo-code-badge">
                          <span className="code">{promo.code}</span>
                          <span className="date">
                            {new Date(promo.usedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
