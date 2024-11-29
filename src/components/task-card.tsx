import { Card } from "@/components/ui/card"
import { Task } from "@/types/task"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onView: (task: Task) => void
}

export function TaskCard({ task, onEdit, onDelete, onView }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-blue-50 p-4 mb-2 cursor-move"
    >
      <h3 className="font-medium">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      <div className="text-xs text-gray-500 mt-2">
        Created at: {new Date(task.createdAt).toLocaleString()}
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={() => onView(task)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Details
        </button>
      </div>
    </Card>
  )
}

