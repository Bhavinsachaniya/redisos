import { PlaygroundData } from './types';

export const CURRICULUM: PlaygroundData = {
  "playground_meta": {
    "title": "Redis Playground: The Robot Warehouse",
    "description": "Learn Redis CLI commands by managing a super-fast in-memory warehouse. Think of Redis as a giant wall of magical lockers.",
    "difficulty": "Beginner",
    "total_levels": 6
  },
  "modules": [
    {
      "id": "module_1",
      "title": "The Basics: Lockers & Notes (Strings)",
      "description": "Learn how to store simple pieces of text (Strings) in key-value pairs.",
      "commands_covered": ["SET", "GET", "EXISTS", "DEL"],
      "steps": [
        {
          "step_id": "1.1",
          "command": "SET <key> <value>",
          "analogy": "Assigning a Locker",
          "explanation": "You want to save a piece of data. You pick a locker name (Key) and put the data (Value) inside it.",
          "task": "Store the name 'Alice' in a locker named 'user:name'.",
          "input_code": "SET user:name Alice"
        },
        {
          "step_id": "1.2",
          "command": "GET <key>",
          "analogy": "Opening the Locker",
          "explanation": "You want to see what is inside a specific locker. You just need to know the locker's name.",
          "task": "Retrieve the value stored in 'user:name'.",
          "input_code": "GET user:name"
        },
        {
          "step_id": "1.3",
          "command": "EXISTS <key>",
          "analogy": "Knocking on the Door",
          "explanation": "Check if a locker is currently being used without actually opening it to read the contents. Returns 1 for yes, 0 for no.",
          "task": "Check if the locker 'user:name' exists.",
          "input_code": "EXISTS user:name"
        },
        {
          "step_id": "1.4",
          "command": "DEL <key>",
          "analogy": "Evicting the Locker",
          "explanation": "You don't need this data anymore. Open the locker, throw away the contents, and make it free for use again.",
          "task": "Delete the 'user:name' key.",
          "input_code": "DEL user:name"
        }
      ]
    },
    {
      "id": "module_2",
      "title": "Self-Destructing Messages (Expiration)",
      "description": "Managing data that shouldn't last forever, like temporary codes or cache.",
      "commands_covered": ["EXPIRE", "TTL", "PERSIST"],
      "steps": [
        {
          "step_id": "2.1",
          "command": "EXPIRE <key> <seconds>",
          "analogy": "Setting the Timer",
          "explanation": "Tell the robot to automatically destroy this locker's contents after a certain number of seconds.",
          "task": "First SET 'session_id' to '123', then set it to expire in 60 seconds.",
          "input_code": "EXPIRE session_id 60"
        },
        {
          "step_id": "2.2",
          "command": "TTL <key>",
          "analogy": "Checking the Stopwatch",
          "explanation": "TTL stands for 'Time To Live'. It tells you exactly how many seconds are left before the data disappears.",
          "task": "Check how much time is left for 'session_id'.",
          "input_code": "TTL session_id"
        },
        {
          "step_id": "2.3",
          "command": "PERSIST <key>",
          "analogy": "Stopping the Countdown",
          "explanation": "You changed your mind! You want to keep this data forever. This removes the expiration timer.",
          "task": "Remove the time limit on 'session_id'.",
          "input_code": "PERSIST session_id"
        }
      ]
    },
    {
      "id": "module_3",
      "title": "The Assembly Line (Lists)",
      "description": "Handling ordered lists of items, like a to-do list or a message queue.",
      "commands_covered": ["LPUSH", "RPUSH", "LPOP", "LRANGE"],
      "steps": [
        {
          "step_id": "3.1",
          "command": "LPUSH <key> <value>",
          "analogy": "Adding to the Front",
          "explanation": "Push a new item onto the Left (Top) of the stack.",
          "task": "Add 'urgent_task' to the front of the 'todo_list'.",
          "input_code": "LPUSH todo_list urgent_task"
        },
        {
          "step_id": "3.2",
          "command": "RPUSH <key> <value>",
          "analogy": "Adding to the Back",
          "explanation": "Push a new item onto the Right (Bottom) of the stack.",
          "task": "Add 'later_task' to the end of the 'todo_list'.",
          "input_code": "RPUSH todo_list later_task"
        },
        {
          "step_id": "3.3",
          "command": "LRANGE <key> <start> <stop>",
          "analogy": "Reading the List",
          "explanation": "Look at items in the list without removing them. 0 is the first item, -1 means the very last item.",
          "task": "View all items in 'todo_list' from start (0) to end (-1).",
          "input_code": "LRANGE todo_list 0 -1"
        },
        {
          "step_id": "3.4",
          "command": "LPOP <key>",
          "analogy": "Popping the Top",
          "explanation": "Remove and return the very first item on the list.",
          "task": "Remove the first item from 'todo_list'.",
          "input_code": "LPOP todo_list"
        }
      ]
    },
    {
      "id": "module_4",
      "title": "The VIP Club (Sets)",
      "description": "Collections of unique items where duplicates are not allowed.",
      "commands_covered": ["SADD", "SMEMBERS", "SISMEMBER"],
      "steps": [
        {
          "step_id": "4.1",
          "command": "SADD <key> <value>",
          "analogy": "The Bouncer",
          "explanation": "Add an item to the group. If it's already there, the robot ignores you (no duplicates allowed!).",
          "task": "Add 'admin' to the 'active_users' set.",
          "input_code": "SADD active_users admin"
        },
        {
          "step_id": "4.2",
          "command": "SMEMBERS <key>",
          "analogy": "Roll Call",
          "explanation": "Show me everyone currently inside the group. The order doesn't matter here.",
          "task": "List all members of 'active_users'.",
          "input_code": "SMEMBERS active_users"
        },
        {
          "step_id": "4.3",
          "command": "SISMEMBER <key> <value>",
          "analogy": "Checking the Guest List",
          "explanation": "Check if a specific value is inside the set.",
          "task": "Check if 'guest' is in 'active_users'.",
          "input_code": "SISMEMBER active_users guest"
        }
      ]
    },
    {
      "id": "module_5",
      "title": "Filing Cabinets (Hashes)",
      "description": "Storing structured objects (like a User Profile) with multiple fields.",
      "commands_covered": ["HSET", "HGET", "HGETALL"],
      "steps": [
        {
          "step_id": "5.1",
          "command": "HSET <key> <field> <value>",
          "analogy": "Filling a Form",
          "explanation": "Store details about one specific object. Here we store a field (like 'age') inside a key (like 'user:100').",
          "task": "Set the 'name' field to 'John' for key 'user:100'.",
          "input_code": "HSET user:100 name John"
        },
        {
          "step_id": "5.2",
          "command": "HGET <key> <field>",
          "analogy": "Reading One Field",
          "explanation": "Retrieve just one specific detail from the folder.",
          "task": "Get the 'name' of 'user:100'.",
          "input_code": "HGET user:100 name"
        },
        {
          "step_id": "5.3",
          "command": "HGETALL <key>",
          "analogy": "Reading the Whole File",
          "explanation": "Get every single field and value stored for this object.",
          "task": "Get all details for 'user:100'.",
          "input_code": "HGETALL user:100"
        }
      ]
    },
    {
      "id": "module_6",
      "title": "Janitor Duty (Housekeeping)",
      "description": "Cleaning up and checking the health of the warehouse.",
      "commands_covered": ["KEYS *", "FLUSHALL", "INFO"],
      "steps": [
        {
          "step_id": "6.1",
          "command": "KEYS *",
          "analogy": "Inventory Search",
          "explanation": "List every single key currently stored in the database. (Warning: Don't do this in a huge warehouse!)",
          "task": "List all keys.",
          "input_code": "KEYS *"
        },
        {
          "step_id": "6.2",
          "command": "INFO",
          "analogy": "System Diagnostics",
          "explanation": "Ask the robot for a status report on memory usage, connected clients, and version numbers.",
          "task": "Get server information.",
          "input_code": "INFO"
        },
        {
          "step_id": "6.3",
          "command": "FLUSHALL",
          "analogy": "The Big Red Button",
          "explanation": "Delete EVERYTHING. Wipe the entire warehouse clean. Dangerous!",
          "task": "Delete all keys in all databases.",
          "input_code": "FLUSHALL"
        }
      ]
    }
  ]
};