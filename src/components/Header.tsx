"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import ThemeSwitcher from "@/components/ThemeSwitcher";

import { HeaderProps } from "@/lib/types";

export default function Header({
  title,
  tokens,
  activeToken,
  onTokenSwitch,
  onTokenDelete,
  onAddNewToken,
  onSignOut,
}: HeaderProps) {
  return (
    <div className="pt-4 pb-4 pr-8 pl-8 flex flex-col md:flex-row justify-between gap-6 border-b">
      <div className="flex item-center space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {activeToken && (
            <span className="font-medium text-sm whitespace-nowrap">
              Selected Token:
            </span>
          )}
          <select
            className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
            value={activeToken?.id || ""}
            onChange={(e) => onTokenSwitch(e.target.value)}
            aria-label="Selected Token"
          >
            {tokens.map((token) => (
              <option key={token.id} value={token.id}>
                {token.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {activeToken && (
            <Button
              variant="outline"
              onClick={() => onTokenDelete(activeToken.id)}
              aria-label="Delete Token"
            >
              Delete Token
            </Button>
          )}
          <Button
            variant="default"
            onClick={onAddNewToken}
            aria-label="Add New Token"
          >
            Add New Token
          </Button>
          <ThemeSwitcher />
          <Button variant="outline" onClick={onSignOut} aria-label="Sign Out">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
