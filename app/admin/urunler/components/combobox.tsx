"use client";

import * as React from "react";
import { Check,  ChevronsUpDownIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComboBoxItem {
  label: string;
  value: string;
}

interface ComboBoxProps {
  items: ComboBoxItem[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ComboBox({ items, selectedValue, onChange, placeholder = "Seçin..." }: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedLabel = items.find(i => i.value === selectedValue)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabel || placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-full p-0 z-50"
        side="bottom"             // aşağıdan açılır
        align="start"            // sola hizalanır (başlangıç noktası)
      >
        <Command>
          <CommandInput placeholder="Ara..." className="h-9" />
          <CommandList className="max-h-[200px] overflow-y-auto"> {/* ≈ 5 item yüksekliği */}
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>

    </Popover>
  );
}
