"use client";

import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "@components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export interface Option {
  value: string;
  label: string;
}

export interface FancyMultiSelectProps {
  options: Option[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function FancyMultiSelect({
  options = [],
  defaultValue = [],
  onValueChange,
  placeholder = "Select options...",
  className,
}: FancyMultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  // Initialize selected items from defaultValue
  React.useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      const selectedOptions = options.filter((option) =>
        defaultValue.includes(option.value)
      );
      setSelected(selectedOptions);
    }
  }, [defaultValue, options]);

  const handleUnselect = React.useCallback(
    (option: Option) => {
      setSelected((prev) => {
        const newSelected = prev.filter((s) => s.value !== option.value);
        // Defer the callback to avoid setState during render
        setTimeout(() => {
          if (onValueChange) {
            onValueChange(newSelected.map((item) => item.value));
          }
        }, 0);
        return newSelected;
      });
    },
    [onValueChange]
  );

  const handleSelect = React.useCallback(
    (option: Option) => {
      setSelected((prev) => {
        const newSelected = [...prev, option];
        // Defer the callback to avoid setState during render
        setTimeout(() => {
          if (onValueChange) {
            onValueChange(newSelected.map((item) => item.value));
          }
        }, 0);
        return newSelected;
      });
    },
    [onValueChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "") {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    []
  );

  const selectables = options.filter(
    (option) => !selected.some((s) => s.value === option.value)
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className || ""}`}
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => {
            return (
              <Badge key={option.value} variant="secondary">
                {option.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue("");
                        handleSelect(option);
                      }}
                      className={"cursor-pointer"}
                    >
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  );
}
