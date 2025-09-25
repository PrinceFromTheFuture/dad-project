"use client";
import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { RolesSelect, Setting } from "@/payload-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  return (
    <button
      ref={setNodeRef}
      type="button"
      className="px-2 py-1 m-1 bg-gray-100 border border-gray-300 rounded cursor-grab"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
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
      {!isInitialPool && (
        <div className="flex items-center gap-2 w-full">
          <Input type="text" value={groupName} onChange={(e) => handleRename(e.target.value)} className="w-min" />
        </div>
      )}
      {isInitialPool && (
        <div className="flex items-center gap-2 w-full">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div
        ref={setNodeRef}
        className={`min-h-44 w-full p-2 m-2 border-2 border-dashed border-gray-300 rounded-lg ${
          id === "available" ? "bg-gray-100" : "bg-amber-100"
        } ${isOver ? "opacity-100" : "opacity-50"}`}
      >
        <div className="flex flex-col items-center gap-2 h-full">
          <div className="flex flex-wrap gap-2 justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Example({ setting, onUpdate, roles }: ExampleProps) {
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({
    available: Array.from(new Set(roles.map((label: Label) => label.id))),
  });
  const [groupNames, setGroupNames] = useState<Map<string, string>>(new Map([["available", "Available Items"]]));

  // Initialize group names and dropped items from settings
  useEffect(() => {
    const newGroupNames = new Map<string, string>([["available", "Available Items"]]);
    const newDroppedItems: Record<string, string[]> = { available: [] };
    const seenItems = new Set<string>();

    // Initialize available items
    roles.forEach((role) => {
      newDroppedItems.available.push(role.id);
    });

    // Process settings to populate groups
    setting?.forEach((category) => {
      if (category.id && category.data && category.data.length > 0) {
        const firstItem = category.data[0];
        const name = typeof firstItem === "string" ? firstItem : (firstItem as Role).name || "Unnamed Category";
        if (newGroupNames.has(category.id)) {
          console.warn(`Duplicate category ID found: ${category.id}`);
        }
        newGroupNames.set(category.id, name);
        newDroppedItems[category.id] = [];

        // Add items to the group, ensuring no duplicates
        category.data.forEach((item) => {
          const itemId = typeof item === "string" ? item : item.id;
          if (!seenItems.has(itemId)) {
            newDroppedItems[category.id].push(itemId);
            seenItems.add(itemId);
            // Remove from available if present
            newDroppedItems.available = newDroppedItems.available.filter((id) => id !== itemId);
          }
        });
      }
    });

    setGroupNames(newGroupNames);
    setDroppedItems(newDroppedItems);
  }, [setting, roles]);

  // Transform droppedItems to categoriesGroups format and notify parent
  useEffect(() => {
    const categoriesGroups: Setting["categoriesGroups"] = Object.entries(droppedItems)
      .filter(([id]) => id !== "available")
      .map(([id, items]) => ({
        id,
        data: items.map((itemId) => {
          const label = roles.find((l: Label) => l.id === itemId);
          return label ? { id: label.id, name: label.name } : itemId;
        }),
      }));
    onUpdate(categoriesGroups);
  }, [droppedItems, onUpdate, roles]);

  // Check for duplicate labels
  const uniqueLabels = Array.from(new Set(roles.map((label: Label) => label.id)));
  if (uniqueLabels.length !== roles.length) {
    console.warn("Duplicate label IDs found:", roles);
  }

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
    if (groupId === "available") return; // Do nothing if clicking in the initial pool

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
    // Limit to 20 groups (excluding "available")
    if (groupNames.size >= 21) {
      return;
    }
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
      <div className="flex flex-col gap-4">
        <Button onClick={addNewGroup} disabled={groupNames.size >= 21} className="self-start">
          Add New Group
        </Button>
        <div className="flex flex-col gap-4">
          <Droppable id="available" title={groupNames.get("available") || "Available Items"} isInitialPool={true}>
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
                <Droppable key={id} id={id} title={groupNames.get(id) || "Unnamed Category"} onRename={handleRenameGroup}>
                  {droppedItems[id]?.map((itemId) => (
                    <Draggable key={itemId} id={itemId} onClick={() => handleItemClick(itemId, id)}>
                      {roles.find((l: Label) => l.id === itemId)?.name || "Unknown Label"}
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