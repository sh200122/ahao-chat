import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  // 存储通过搜索找到的用户信息
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  // 处理搜索功能
  const handleSearch = async (e) => {
    e.preventDefault();
    // 获取表单数据
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      // 获取 firestore 中的 "user" 集合的引用
      const userRef = collection(db, "users");

      // 查询 firestore 中是否存在与输入用户名相匹配的用户
      const q = query(userRef, where("username", "==", username));

      // 执行查询并获取查询结果
      const querySnapShot = await getDocs(q);

      // 如果查询结果不为空，将找到的用户信息存储到状态中
      if (!querySnapShot.empty) {
        // 取第一个匹配的用户
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 处理添加用户功能
  const handleAdd = async () => {
    // 获取 "chats" 集合的引用
    const chatRef = collection(db, "chats");
    // 获取 "userchats" 集合的引用
    const userChatsRef = collection(db, "userchats");

    try {
      // 为新聊天生成一个新的文档引用
      const newChatRef = doc(chatRef);

      // 创建一个新的聊天记录，并存储到 firestore 中
      await setDoc(newChatRef, {
        // 使用 firebase 服务器的时间戳
        createdAt: serverTimestamp(),
        messages: [],
      });

      // 更新被添加用户的聊天记录，将新创建的聊天加入到他们的聊天列表中
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      // 同样更新当前用户的聊天记录，将新创建的聊天加入到当前用户的聊天列表中
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="用户名" name="username" />
        <button>搜索</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>添加用户</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
