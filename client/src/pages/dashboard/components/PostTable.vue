<template>
  <div class="card shadow-sm border-0 bg-white">
    <div class="card-body p-0">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-highlight" role="status"></div>
        <p class="mt-2 text-muted small">Loading posts...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="posts.length === 0" class="text-center py-5 text-muted">
        <p class="mb-2 fs-4">📭</p>
        <p class="mb-3">No posts found in this section.</p>
        <button @click="$emit('create-post')" class="btn btn-sm btn-highlight">
          Create Your First Post
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="table-responsive">
        <table class="table table-striped table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">Title</th>
              <th scope="col" v-if="showAuthorColumn">Author</th>
              <th scope="col">Date</th>
              <th scope="col">Comments</th>
              <th scope="col" class="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post._id">
              <td class="ps-4">
                <router-link :to="'/blogs/' + post._id" class="fw-semibold text-decoration-none text-dark">
                  {{ post.title }}
                </router-link>
              </td>
              <td v-if="showAuthorColumn">
                <span class="badge bg-light text-dark border">
                  {{ post.author?.username || 'Unknown' }}
                </span>
              </td>
              <td class="text-muted small">
                {{ formatDate(post.creationDate || post.createdAt) }}
              </td>
              <td>
                <span class="badge bg-secondary-subtle text-secondary text-center">
                  💬 {{ post.comments?.length || 0 }}
                </span>
              </td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm">
                  <router-link
                    :to="'/blogs/' + post._id"
                    class="btn btn-outline-highlight"
                    title="View post"
                  >
                    🔍 View 
                  </router-link>

                  <button
                    v-if="canManage(post)"
                    @click="$emit('edit-post', post)"
                    class="btn btn-outline-secondary"
                    title="Edit post"
                  >
                    ✏️ Edit
                  </button>

                  <!-- Delete action kept as danger -->
                  <button
                    v-if="canManage(post)"
                    @click="$emit('delete-post', post._id)"
                    class="btn btn-outline-danger"
                    title="Delete post"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showAuthorColumn: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

defineEmits(['edit-post', 'delete-post', 'create-post']);

function canManage(post) {
  if (props.isAdmin) return true;
  const authorId = post.author?._id || post.author;
  return props.currentUserId && authorId === props.currentUserId;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>
