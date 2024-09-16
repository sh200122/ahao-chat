import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 配置对象，包含项目的关键信息，需要通过环境变量动态获取
const firebaseConfig = {
  apiKey: "AIzaSyD - pLVd8dSamtvKqtXcB5QWKTgGvJU4wlo",
  authDomain: "chat-app-cc97e.firebaseapp.com",
  projectId: "chat-app-cc97e",
  storageBucket: "chat-app-cc97e.appspot.com",
  messagingSenderId: "1007238666521",
  appId: "1:1007238666521:web:7adb222147f78ec7860d88",
};

// 使用配置对象初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 导出 firebase认证，firebase数据库和存储服务实例
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
