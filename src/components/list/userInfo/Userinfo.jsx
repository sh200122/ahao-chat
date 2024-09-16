import { useState } from "react";
import "./userInfo.css";
import { toast } from "react-toastify";
import { auth, db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useUserStore } from "../../../lib/userStore";
import upload from "../../../lib/upload";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [avatar, setAvatar] = useState({
    file: null,
    url: currentUser.avatar || "./avatar.png",
  });
  const [username, setUsername] = useState(currentUser.username || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [sign, setSign] = useState(currentUser.sign || "");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 控制是否显示编辑表单

  // 切换编辑模式
  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  // 处理头像选择
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // 更新用户信息
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imgUrl = avatar.url;

      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      // 更新 Firestore 中的用户信息
      const userDocRef = doc(db, "users", currentUser.id);
      await updateDoc(userDocRef, {
        username,
        email,
        sign,
        avatar: imgUrl,
      });

      toast.success("用户信息已成功更新！");
      setIsEditing(false); // 隐藏编辑表单
    } catch (err) {
      console.log(err);
      toast.error("更新用户信息失败！");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userInfo">
      {/* 用户头像和用户名部分 */}
      <div className="user">
        <img src={avatar.url || "./avatar.png"} alt="用户头像" />
        <h2>{username}</h2>
      </div>
      {/* 编辑和其他操作图标 */}
      <div className="icons">
        <img src="./more.png" alt="更多操作" />
        <img src="./edit.png" alt="编辑" onClick={toggleEdit} />{" "}
        {/* 点击编辑切换表单显示 */}
      </div>

      {/* 如果处于编辑模式，则显示编辑表单 */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="editForm">
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="头像预览" />
            上传新头像
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="个性签名"
            value={sign}
            onChange={(e) => setSign(e.target.value)}
          />
          <button disabled={loading}>
            {loading ? "保存中..." : "保存更改"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserInfo;
