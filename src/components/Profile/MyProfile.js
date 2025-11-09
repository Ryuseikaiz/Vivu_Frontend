import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import "./MyProfile.css";

const MyProfile = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || "https://avatar.iran.liara.run/public"
  );
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!user) {
    return <div className="myprofile-loading">Đang tải thông tin...</div>;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
      };

      await axios.put("/api/users/profile", updateData);

      await refreshUser();

      setMessage({
        type: "success",
        text: "Cập nhật thông tin thành công! 🎉",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Không thể cập nhật thông tin.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword !== confirmNewPassword) {
      setMessage({
        type: "error",
        text: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
      });
      setLoading(false);
      return;
    }

    if (!currentPassword || !newPassword) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.",
      });
      setLoading(false);
      return;
    }

    try {
      await axios.put("/api/users/password", {
        currentPassword,
        newPassword,
      });

      setMessage({ type: "success", text: "Đổi mật khẩu thành công! ✅" });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Vui lòng chọn ảnh đại diện mới." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formAvatar = new FormData();
      formAvatar.append("avatar", selectedFile);

      await axios.post("/api/users/avatar", formAvatar, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await refreshUser();
      setSelectedFile(null);
      setMessage({
        type: "success",
        text: "Cập nhật ảnh đại diện thành công! 🖼️",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Không thể cập nhật ảnh đại diện.",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log("user: ", user);

  return (
    <div className="myprofile-container">
      <h2>Tài khoản của tôi</h2>

      {message && (
        <div className={`myprofile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content-grid">
        <div className="avatar-section card">
          <h3>Ảnh đại diện</h3>
          <div className="avatar-display">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="user-profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleAvatarChange}
              accept="image/*"
            />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
          >
            {selectedFile ? "Đã chọn ảnh mới" : "Chọn ảnh"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdateAvatar}
            disabled={loading || !selectedFile}
          >
            {loading && selectedFile ? "Đang tải lên..." : "Cập nhật Avatar"}
          </button>
        </div>

        <form className="info-section card" onSubmit={handleUpdateProfile}>
          <h3>Thông tin cơ bản</h3>
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </button>
        </form>

        <form className="password-section card" onSubmit={handleUpdatePassword}>
          <h3>Đổi mật khẩu</h3>
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
