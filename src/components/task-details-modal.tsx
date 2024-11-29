import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Task } from "@/types/task"

interface TaskDetailsModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

export function TaskDetailsModal({ task, open, onClose }: TaskDetailsModalProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Title: {task.title}</h3>
          </div>
          <div>
            <h4 className="text-sm font-medium">Description:</h4>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            Created at: {new Date(task.createdAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

