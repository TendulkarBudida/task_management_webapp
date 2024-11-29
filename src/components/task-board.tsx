"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Task, TaskStatus } from "@/types/task"
import { TaskCard } from "./task-card"
import { TaskDetailsModal } from "./task-details-modal"
import { EditTaskModal } from "./edit-task-modal"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase, syncUserWithPayload } from "@/lib/supabaseClient"
import axios from "axios"

const COLUMNS: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"]

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewTask, setViewTask] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await syncUserWithPayload(user)
        fetchTasks()
      }
    }

    fetchUserAndTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks')
      setTasks(response.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over.id)

      const updatedTasks = arrayMove(tasks, oldIndex, newIndex)
      setTasks(updatedTasks)

      try {
        await axios.patch(`/api/tasks/${active.id}`, {
          status: updatedTasks[newIndex].status,
        })
      } catch (error) {
        console.error('Error updating task status:', error)
        // Revert the change if the API call fails
        setTasks(tasks)
      }
    }

    setActiveId(null)
  }

  const handleAddTask = async () => {
    try {
      const response = await axios.post('/api/tasks', {
        title: "New Task",
        description: "New Description",
        status: "TODO",
      })
      setTasks([...tasks, response.data])
      setEditTask(response.data)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`)
      setTasks(tasks.filter((task) => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSaveTask = async (updatedTask: Task) => {
    try {
      const response = await axios.patch(`/api/tasks/${updatedTask.id}`, updatedTask)
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? response.data : task)))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Redirect to login page or update UI state
  }

  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleAddTask}>Add Task</Button>
        <Button variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/2">
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>Sort By:</span>
          <Select value={sortBy} onValueChange={(value: "recent" | "oldest") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div key={column} className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4">{column}</h2>
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks
                  .filter((task) => task.status === column)
                  .map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTasks
                  .filter((task) => task.status === column)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setEditTask}
                      onDelete={handleDeleteTask}
                      onView={setViewTask}
                    />
                  ))}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <TaskCard
                    task={tasks.find((task) => task.id === activeId)!}
                    onEdit={setEditTask}
                    onDelete={handleDeleteTask}
                    onView={setViewTask}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ))}
      </div>
      <TaskDetailsModal
        task={viewTask}
        open={!!viewTask}
        onClose={() => setViewTask(null)}
      />
      <EditTaskModal
        task={editTask}
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSave={handleSaveTask}
      />
    </div>
  )
}

