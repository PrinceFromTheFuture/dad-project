"use client";
import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RolesSelect, Setting } from "@/payload-types";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, GripVertical, Pen, Plus } from "lucide-react";

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

interface CategoriesGroupsProps {
  roles: Role[];
  setting: Setting["categoriesGroups"];
  onUpdate: (data: Setting["categoriesGroups"]) => void;
}

function Draggable({ id, children, onClick }: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  const buttonVariant = buttonVariants({ size: "sm", variant: "outline" });
  return (
    <button
      ref={setNodeRef}
      className={cn(" ", buttonVariant, "transition-none text-sm font-medium cursor-grabbing")}
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
  const [tempGroupName, setTempGroupName] = useState(title); // Temporary state for input
  const [isEditing, setIsEditing] = useState(false);

  // Sync local groupName with title prop when it changes
  useEffect(() => {
    setGroupName(title);
    setTempGroupName(title);
  }, [title]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // When exiting edit mode, update parent state
      if (onRename && tempGroupName !== groupName) {
        onRename(id, tempGroupName);
      }
      setGroupName(tempGroupName);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Update parent state on blur if name changed
    if (onRename && tempGroupName !== groupName) {
      onRename(id, tempGroupName);
    }
    setGroupName(tempGroupName);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      // Update parent state on Enter if name changed
      if (onRename && tempGroupName !== groupName) {
        onRename(id, tempGroupName);
      }
      setGroupName(tempGroupName);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempGroupName(e.target.value); // Update temporary state only
  };

  return (
    <div>
      {isInitialPool && <h3 className="mb-4 font-medium">{title}</h3>}
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-44 w-full p-0 rounded-lg",
          id !== "available" && "bg-sidebar p-4 border-2 border-dashed",
          id !== "available" && isOver && "bg-primary/5 border-2 border-primary"
        )}
      >
        {!isInitialPool && (
          <div onClick={handleEditToggle} className="flex items-center gap-2 mb-4 w-full">
            <div className="flex w-min gap-2 flex-row-reverse items-center whitespace-nowrap">
              {isEditing ? (
                <Input
                  type="text"
                  value={tempGroupName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="w-min bg-white"
                  autoFocus
                />
              ) : (
                <span className="font-medium cursor-pointer">{groupName}</span>
              )}
              <Pen className="size-4 cursor-pointer text-muted-foreground hover:text-primary" />
            </div>
          </div>
        )}
        <div className={cn("flex flex-wrap gap-2 justify-start")}>{children}</div>
      </div>
    </div>
  );
}

export function CategoriesGroups({ setting, onUpdate, roles }: CategoriesGroupsProps) {
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({
    available: roles.map((role) => role.id),
  });
  const [groupNames, setGroupNames] = useState<Map<string, string>>(
    new Map([["available", "Available Agent Roles"]])
  );

  // Initialize groups and items from settings
  useEffect(() => {
    const newGroupNames = new Map<string, string>([["available", "Available Agent Roles"]]);
    const newDroppedItems: Record<string, string[]> = {
      available: roles.map((role) => role.id),
    };
    const seenItems = new Set<string>();

    // Process settings to populate groups
    if (setting) {
      setting.forEach((category) => {
        if (category?.id && category.data && category.data.length > 0) {
          // Use provided groupName or default to a generated name
          const groupName = category.groupName || `Group ${category.id}`;
          newGroupNames.set(category.id, groupName);
          newDroppedItems[category.id] = [];

          // Add items to the group, ensuring no duplicates
          category.data.forEach((item) => {
            const itemId = typeof item === "string" ? item : item.id;
            if (!seenItems.has(itemId)) {
              newDroppedItems[category.id].push(itemId);
              seenItems.add(itemId);
              // Remove from available pool
              newDroppedItems.available = newDroppedItems.available.filter((id) => id !== itemId);
            }
          });
        }
      });
    }

    setGroupNames(newGroupNames);
    setDroppedItems(newDroppedItems);
  }, [setting, roles]);

  // Update parent with the current groups, their content, and group names
  useEffect(() => {
    const categoriesGroups: Setting["categoriesGroups"] = Array.from(groupNames.keys())
      .filter((id) => id !== "available")
      .map((id) => ({
        id,
        groupName: groupNames.get(id) || `Group ${id}`,
        data:
          droppedItems[id]?.map((itemId) => {
            const role = roles.find((r) => r.id === itemId);
            return role ? { id: role.id, name: role.name } : itemId;
          }) || [],
      }))
      .filter((group) => group.data.length > 0); // Exclude empty groups

    onUpdate(categoriesGroups.length > 0 ? categoriesGroups : null);
  }, [droppedItems, groupNames, onUpdate, roles]);

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

      return newState;
    });
  };

  const handleRenameGroup = (id: string, newName: string) => {
    setGroupNames((prev) => {
      const newNames = new Map(prev);
      newNames.set(id, newName);
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

      return newState;
    });
  };

  const addNewGroup = () => {
    if (groupNames.size >= 21) return; // Limit to 20 groups (excluding "available")
    const newGroupId = `group-${Date.now()}`;
    setDroppedItems((prev) => ({
      ...prev,
      [newGroupId]: [],
    }));
    setGroupNames((prev) => {
      const newNames = new Map(prev);
      newNames.set(newGroupId, `New Group ${newNames.size}`);
      return newNames;
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col relative mt-8 gap-4">
        <Button
          onClick={addNewGroup}
          disabled={groupNames.size >= 21}
          className="self-start absolute right-0 -top-2"
        >
          <Plus />
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
                {roles.find((r) => r.id === id)?.name || "Unknown Role"}
              </Draggable>
            ))}
          </Droppable>
          <div className="flex flex-col gap-4">
            {Array.from(groupNames.keys())
              .filter((id) => id !== "available")
              .map((id) => (
                <Droppable
                  key={id}
                  id={id}
                  title={groupNames.get(id) || "Unnamed Group"}
                  onRename={handleRenameGroup}
                >
                  {droppedItems[id]?.map((itemId) => (
                    <Draggable key={itemId} id={itemId} onClick={() => handleItemClick(itemId, id)}>
                      {roles.find((r) => r.id === itemId)?.name || "Unknown Role"}
                    </Draggable>
                  ))}
                </Droppable>
              ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}