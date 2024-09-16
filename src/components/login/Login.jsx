import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  // 管理头像文件和预览url的状态
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  // 处理头像文件选择事件，更新头像状态
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        // 设置选中的头像文件
        file: e.target.files[0],
        // 生成头像的预览url
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // 处理用户注册逻辑
  const handleRegister = async (e) => {
    e.preventDefault();
    // 设置加载状态为 true
    setLoading(true);

    // 从表单中获取输入数据
    const formData = new FormData(e.target);
    // 从表单数据中提取用户名，邮箱和密码
    const { username, email, password, sign } = Object.fromEntries(formData);

    // 输入验证：检查是否填写了用户名，邮箱和密码
    if (!username || !email || !password) return toast.warn("请输入所有字段！");
    if (!avatar.file) return toast.warn("请上传头像！");

    // 验证用户名是否唯一
    // 获取 firebase firestore 中 "users" 集合的引用
    const usersRef = collection(db, "users");
    // 查询用户名是否已经存在
    const q = query(usersRef, where("username", "==", username));
    // 执行查询
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("用户名已被使用，请使用其他用户名");
    }

    try {
      // 使用 firebase 的 creatUserWithEmailAndPassword 创建新用户
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
        sign
      );
      // 上传头像文件，并获取上传后的 URL
      const imgUrl = await upload(avatar.file);
      // 将用户信息保存到 firebase 中的 "users" 集合
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        sign,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      // 为用户创建空的聊天记录
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      // 注册成功
      toast.success("账户创建成功！您现在可以登录了！");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 用户登录逻辑
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>欢迎回来</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="邮箱" name="email" />
          <input type="password" placeholder="密码" name="password" />
          <button disabled={loading}>{loading ? "加载中" : "登录"}</button>
        </form>
      </div>
      {/* 分隔登录注册 */}
      <div className="separator"></div>
      <div className="item">
        <h2>创建一个账户</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            {/* 头像预览 */}
            <img src={avatar.url || "./avatar.png"} alt="" />
            上传头像
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="用户名" name="username" />
          <input type="text" placeholder="邮箱" name="email" />
          <input type="password" placeholder="密码" name="password" />
          <input type="text" placeholder="个性签名" name="sign" />
          <button disabled={loading}>{loading ? "加载中" : "注册"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
