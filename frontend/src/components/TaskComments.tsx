import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, MessageSquare, Edit2, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { gql, useQuery, useMutation } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'

const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: ID!) {
    getTaskComments(taskId: $taskId) {
      id
      content
      createdAt
      updatedAt
      user {
        id
        name
        email
      }
    }
  }
`

const GET_TASK_ACTIVITY = gql`
  query GetTaskActivity($taskId: ID!, $limit: Int) {
    getTaskActivity(taskId: $taskId, limit: $limit) {
      id
      action
      oldValue
      newValue
      createdAt
      user {
        name
      }
    }
  }
`

const CREATE_COMMENT = gql`
  mutation CreateComment($taskId: ID!, $content: String!) {
    createComment(taskId: $taskId, content: $content) {
      id
      content
      createdAt
      user {
        id
        name
        email
      }
    }
  }
`

const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      id
      content
      updatedAt
    }
  }
`

const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`

interface TaskCommentsProps {
  taskId: string
  currentUserId?: string
}

export function TaskComments({ taskId, currentUserId }: TaskCommentsProps) {
  const { toast } = useToast()
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments')

  // Queries
  const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId },
    skip: !taskId,
  })

  const { data: activityData, loading: activityLoading } = useQuery(GET_TASK_ACTIVITY, {
    variables: { taskId, limit: 20 },
    skip: !taskId || activeTab !== 'activity',
  })

  // Mutations
  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setNewComment('')
      refetchComments()
      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const [updateComment] = useMutation(UPDATE_COMMENT, {
    onCompleted: () => {
      setEditingCommentId(null)
      setEditContent('')
      refetchComments()
      toast({
        title: "Success",
        description: "Comment updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onCompleted: () => {
      refetchComments()
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  const handleCreateComment = () => {
    if (!newComment.trim()) return
    createComment({
      variables: {
        taskId,
        content: newComment.trim()
      }
    })
  }

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return
    updateComment({
      variables: {
        id: commentId,
        content: editContent.trim()
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment({
        variables: { id: commentId }
      })
    }
  }

  const startEditing = (comment: any) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingCommentId(null)
    setEditContent('')
  }

  const getActivityDescription = (activity: any) => {
    switch (activity.action) {
      case 'created':
        return 'created the task'
      case 'status_changed':
        return `changed status from ${activity.oldValue} to ${activity.newValue}`
      case 'assigned':
        return `assigned to ${activity.newValue}`
      case 'priority_changed':
        return `changed priority from ${activity.oldValue} to ${activity.newValue}`
      case 'commented':
        return 'added a comment'
      case 'due_date_changed':
        return `changed due date to ${activity.newValue}`
      default:
        return activity.action
    }
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({commentsData?.getTaskComments?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'comments' ? (
          <div className="space-y-4">
            {commentsLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
            ) : commentsData?.getTaskComments?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-sm">Be the first to comment on this task</p>
              </div>
            ) : (
              commentsData?.getTaskComments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {comment.updatedAt !== comment.createdAt && (
                            <span className="text-xs text-muted-foreground ml-1">(edited)</span>
                          )}
                        </div>
                        {comment.user.id === currentUserId && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => startEditing(comment)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {activityLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
            ) : activityData?.getTaskActivity?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No activity yet</p>
              </div>
            ) : (
              activityData?.getTaskActivity?.map((activity: any) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <div>
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-muted-foreground ml-1">
                        {getActivityDescription(activity)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Comment Input */}
      {activeTab === 'comments' && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleCreateComment()
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to send
            </span>
            <Button
              size="sm"
              onClick={handleCreateComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}