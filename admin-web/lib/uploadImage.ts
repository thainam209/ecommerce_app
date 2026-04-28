import API_BASE_URL from '../config/api';
// admin-web/lib/uploadImage.ts

// TODO: thay bằng chỗ em lưu token (AsyncStorage, context, Redux...)
// Nếu route upload KHÔNG dùng authenticate thì bỏ token luôn.
async function getAuthToken(): Promise<string | null> {
  // ví dụ:
  // return await AsyncStorage.getItem("token");
  return null;
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); // tên field phải là "file" giống Postman

  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // KHÔNG set Content-Type, để browser tự set boundary cho form-data
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Upload image error:", json);
    throw new Error(json?.error || "Upload image failed");
  }

  // backend đang trả { url, public_id }
  if (!json.url) {
    throw new Error("No URL returned from upload");
  }

  return json.url as string;
}