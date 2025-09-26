"use client";
import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RolesSelect, Setting } from "@/payload-types";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Grid2x2, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Label {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  title: string;
  onRename?: (id: string, newName: string) => void;
  isInitialPool?: boolean;
}

interface ExampleProps {
  roles: Role[];
  setting: Setting["categoriesGroups"];
  onUpdate: (data: Setting["categoriesGroups"]) => void;
}

function Draggable({ id, children, onClick }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const buttonVarient = buttonVariants({ size: "sm", variant: "outline" });
  return (
    <button
      ref={setNodeRef}
      className={cn("", buttonVarient, "transition-none text-sm font-medium cursor-grabbing")}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <GripVertical className="size-4" />
      {children}
    </button>
  );
}

function Droppable({ id, children, title, onRename, isInitialPool = false }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const [groupName, setGroupName] = useState(title);

  const handleRename = (newVal: string) => {
    setGroupName(newVal);
    if (onRename) {
      onRename(id, newVal);
    }
  };

  useEffect(() => {
    if (groupName !== title && onRename) {
      onRename(id, groupName);
    }
  }, [groupName, id, onRename, title]);

  return (
    <div>
      {isInitialPool && (
        <div className="flex items-center gap-2 w-full">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-44 w-full p-4 rounded-lg transition-all",
          id !== "available" && "bg-sidebar border-0 border-dashed border-primary",
          id !== "available" && isOver && "bg-primary/5 border-2"
        )}
      >
        {!isInitialPool && (
          <div className="flex items-center justify-between mb-3 w-full">
            <Input
              type="text"
              value={groupName}
              onChange={(e) => handleRename(e.target.value)}
              className="w-min bg-white"
            />
            <Button variant={"outline"}>
              <Edit />
            </Button>
          </div>
        )}

        <div className={cn("flex flex-wrap gap-2 justify-start")}>{children}</div>
      </div>
    </div>
  );
}

export function Example({ setting, onUpdate, roles }: ExampleProps) {
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({
    available: Array.from(new Set(roles.map((label: Label) => label.id))),
  });
  const [groupNames, setGroupNames] = useState<Map<string, string>>(
    new Map([["available", "Available Agent Roles"]])
  );

  // Function to trigger onUpdate with complete group data
  const triggerUpdate = (items: Record<string, string[]>) => {
    const categoriesGroups: Setting["categoriesGroups"] = Object.entries(items)
      .filter(([id]) => id !== "available")
      .map(([id, itemIds]) => ({
        id,
        data: itemIds.map((itemId) => {
          const role = roles.find((r: Role) => r.id === itemId);
          return role ? { id: role.id, name: role.name } : itemId;
        }),
        name: groupNames.get(id) || `Group ${id}`,
      }));
    onUpdate(categoriesGroups);
  };

  // Initialize group names and dropped items from settings
  useEffect(() => {
    const newGroupNames = new Map<string, string>([["available", "Available Agent Roles"]]);
    const newDroppedItems: Record<string, string[]> = { available: [] };
    const seenItems = new Set<string>();

    // Initialize available Agent Roles
    roles.forEach((role) => {
      newDroppedItems.available.push(role.id);
    });

    // Process settings to populate groups
    setting?.forEach((category) => {
      if (category.id && category.data && category.data.length > 0) {
        newGroupNames.set(category.id, category.name || `Group ${category.id}`);
        newDroppedItems[category.id] = [];

        // Add items to the group, ensuring no duplicates
        category.data.forEach((item) => {
          const itemId = typeof item === "string" ? item : item.id;
          if (!seenItems.has(itemId)) {
            newDroppedItems[category.id].push(itemId);
            seenItems.add(itemId);
            newDroppedItems.available = newDroppedItems.available.filter((id) => id !== itemId);
          }
        });
      }
    });

    setGroupNames(newGroupNames);
    setDroppedItems(newDroppedItems);
    triggerUpdate(newDroppedItems);
  }, [setting, roles]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const draggableId = active.id as string;
    const targetDroppable = over.id as string;

    setDroppedItems((prev) => {
      const newState = { ...prev };

      // Remove the draggable item from all groups
      Object.keys(newState).forEach((groupId) => {
        newState[groupId] = newState[groupId].filter((id) => id !== draggableId);
      });

      // Add to the target droppable
      if (!newState[targetDroppable]) {
        newState[targetDroppable] = [];
      }
      if (!newState[targetDroppable].includes(draggableId)) {
        newState[targetDroppable].push(draggableId);
      }

      // Clean up empty groups (except 'available')
      Object.keys(newState).forEach((groupId) => {
        if (groupId !== "available" && newState[groupId].length === 0) {
          delete newState[groupId];
          setGroupNames((prevNames) => {
            const newNames = new Map(prevNames);
            newNames.delete(groupId);
            return newNames;
          });
        }
      });

      triggerUpdate(newState);
      return newState;
    });
  };

  const handleRenameGroup = (id: string, newName: string) => {
    setGroupNames((prev) => {
      const newNames = new Map(prev);
      newNames.set(id, newName);
      triggerUpdate(droppedItems);
      return newNames;
    });
  };

  const handleItemClick = (itemId: string, groupId: string) => {
    if (groupId === "available") return;

    setDroppedItems((prev) => {
      const newState = { ...prev };

      // Remove from current group
      newState[groupId] = newState[groupId].filter((id) => id !== itemId);

      // Add to available pool
      if (!newState.available) {
        newState.available = [];
      }
      if (!newState.available.includes(itemId)) {
        newState.available.push(itemId);
      }

      // Clean up empty groups (except 'available')
      if (groupId !== "available" && newState[groupId].length === 0) {
        delete newState[groupId];
        setGroupNames((prevNames) => {
          const newNames = new Map(prevNames);
          newNames.delete(groupId);
          return newNames;
        });
      }

      triggerUpdate(newState);
      return newState;
    });
  };

  const addNewGroup = () => {
    if (groupNames.size >= 21) {
      return;
    }
    const newGroupId = `group-${Date.now()}`;
    setDroppedItems((prev) => {
      const newState = {
        ...prev,
        [newGroupId]: [],
      };
      triggerUpdate(newState);
      return newState;
    });
    setGroupNames((prev) => {
      const newNames = new Map(prev);
      newNames.set(newGroupId, `New Group ${newNames.size}`);
      return newNames;
    });
  };

  const deleteGroup = (groupId: string) => {
    if (groupId === "available") return;

    setDroppedItems((prev) => {
      const newState = { ...prev };
      const itemsToMove = newState[groupId] || [];

      // Move items back to available pool
      newState.available = [...newState.available, ...itemsToMove];
      delete newState[groupId];

      setGroupNames((prevNames) => {
        const newNames = new Map(prevNames);
        newNames.delete(groupId);
        return newNames;
      });

      triggerUpdate(newState);
      return newState;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">
        <Button onClick={addNewGroup} disabled={groupNames.size >= 21} className="self-start">
          Add New Group
        </Button>
        <div className="flex flex-col gap-4">
          <Droppable
            id="available"
            title={groupNames.get("available") || "Available Agent Roles"}
            isInitialPool={true}
          >
            {droppedItems["available"]?.map((id) => (
              <Draggable key={id} id={id}>
                {roles.find((l: Label) => l.id === id)?.name || "Unknown Label"}
              </Draggable>
            ))}
          </Droppable>

          <div className="flex flex-col gap-4">
            {Array.from(groupNames.keys())
              .filter((id) => id !== "available")
              .map((id) => (
                <div key={id} className="relative">
                  <Droppable
                    id={id}
                    title={groupNames.get(id) || "Unnamed Category"}
                    onRename={handleRenameGroup}
                  >
                    {droppedItems[id]?.map((itemId) => (
                      <Draggable key={itemId} id={itemId} onClick={() => handleItemClick(itemId, id)}>
                        {roles.find((l: Label) => l.id === itemId)?.name || "Unknown Label"}
                      </Draggable>
                    ))}
                  </Droppable>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => deleteGroup(id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}