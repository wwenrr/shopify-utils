import { apiGet, apiPost, apiDelete } from '@/shared/utils';

const GITHUB_USER_API = 'https://api.github.com/user';
const GITHUB_GISTS_API = 'https://api.github.com/gists';

export async function validateGithubToken(token) {
  if (!token || !token.trim()) {
    throw new Error('Token không được để trống');
  }

  try {
    const response = await apiGet(GITHUB_USER_API, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    return {
      valid: true,
      user: response,
    };
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
    if (error.status === 403) {
      throw new Error('Token không có quyền truy cập');
    }
    if (error.status === 404) {
      throw new Error('API endpoint không tồn tại');
    }
    throw new Error(error.message || 'Lỗi xác thực token');
  }
}

export async function fetchGists(token) {
  if (!token || !token.trim()) {
    throw new Error('Token không được để trống');
  }

  try {
    const response = await apiGet(GITHUB_GISTS_API, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    return response;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
    if (error.status === 403) {
      throw new Error('Token không có quyền truy cập gists');
    }
    throw new Error(error.message || 'Lỗi khi tải danh sách gist');
  }
}

export async function createGist(token, description, content = 'init') {
  if (!token || !token.trim()) {
    throw new Error('Token không được để trống');
  }

  if (!description || !description.trim()) {
    throw new Error('Tên gist không được để trống');
  }

  const fileName = `${description.trim().toLowerCase().replace(/\s+/g, '-')}.md`;

  try {
    const response = await apiPost(
      GITHUB_GISTS_API,
      {
        description: description.trim(),
        public: false,
        files: {
          [fileName]: {
            content: content,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      }
    );

    return response;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
    if (error.status === 403) {
      throw new Error('Token không có quyền tạo gist');
    }
    throw new Error(error.message || 'Lỗi khi tạo gist');
  }
}

export async function deleteGist(token, gistId) {
  if (!token || !token.trim()) {
    throw new Error('Token không được để trống');
  }

  if (!gistId || !gistId.trim()) {
    throw new Error('Gist ID không được để trống');
  }

  try {
    await apiDelete(`${GITHUB_GISTS_API}/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    return true;
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
    if (error.status === 403) {
      throw new Error('Token không có quyền xóa gist');
    }
    if (error.status === 404) {
      throw new Error('Gist không tồn tại');
    }
    throw new Error(error.message || 'Lỗi khi xóa gist');
  }
}

