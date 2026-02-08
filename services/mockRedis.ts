import { RedisStore, CommandResult } from '../types';

// Helper to parse command string
const parseCommand = (cmd: string) => {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0]?.toUpperCase();
  const args = parts.slice(1);
  return { command, args };
};

// Check for expired keys and return new store if changes occur
export const checkExpirations = (store: RedisStore): RedisStore | null => {
  const now = Date.now();
  let changed = false;
  const newStore = { ...store };

  Object.keys(newStore).forEach(key => {
    const entry = newStore[key];
    if (entry.expiresAt && entry.expiresAt <= now) {
      delete newStore[key];
      changed = true;
    }
  });

  return changed ? newStore : null;
};

export const executeCommand = (input: string, store: RedisStore): CommandResult => {
  const { command, args } = parseCommand(input);
  const newStore = { ...store };
  
  if (!command) {
    return { success: false, output: '' };
  }

  try {
    switch (command) {
      // --- STRINGS ---
      case 'SET': {
        if (args.length < 2) return { success: false, output: "(error) ERR wrong number of arguments for 'set' command" };
        const [key, ...valueParts] = args;
        const value = valueParts.join(' ');
        // SET removes any existing TTL/Expiration
        newStore[key] = { type: 'string', value, createdAt: Date.now() };
        return { success: true, output: 'OK', newStore };
      }
      
      case 'GET': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'get' command" };
        const key = args[0];
        if (!newStore[key]) return { success: true, output: '(nil)' };
        if (newStore[key].type !== 'string') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        return { success: true, output: `"${newStore[key].value}"` };
      }

      case 'EXISTS': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'exists' command" };
        const key = args[0];
        return { success: true, output: newStore[key] ? '(integer) 1' : '(integer) 0' };
      }

      case 'DEL': {
        if (args.length < 1) return { success: false, output: "(error) ERR wrong number of arguments for 'del' command" };
        let count = 0;
        args.forEach(key => {
          if (newStore[key]) {
            delete newStore[key];
            count++;
          }
        });
        return { success: true, output: `(integer) ${count}`, newStore };
      }

      // --- EXPIRATION ---
      case 'EXPIRE': {
        if (args.length !== 2) return { success: false, output: "(error) ERR wrong number of arguments for 'expire' command" };
        const [key, seconds] = args;
        
        // Check integer
        const secondsInt = parseInt(seconds);
        if (isNaN(secondsInt)) return { success: false, output: '(error) ERR value is not an integer or out of range' };
        
        // If key doesn't exist, return 0
        if (!newStore[key]) return { success: true, output: '(integer) 0' };

        newStore[key] = { 
          ...newStore[key], 
          ttl: secondsInt, // For display snapshot
          expiresAt: Date.now() + (secondsInt * 1000) 
        };
        return { success: true, output: '(integer) 1', newStore };
      }

      case 'TTL': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'ttl' command" };
        const key = args[0];
        if (!newStore[key]) return { success: true, output: '(integer) -2' }; // Key doesn't exist
        
        if (!newStore[key].expiresAt) return { success: true, output: '(integer) -1' }; // No expiry
        
        const remaining = Math.ceil((newStore[key].expiresAt! - Date.now()) / 1000);
        
        // If it's 0 or less, it should technically be expired
        if (remaining <= 0) return { success: true, output: '(integer) -2' };
        
        return { success: true, output: `(integer) ${remaining}` };
      }

      case 'PERSIST': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'persist' command" };
        const key = args[0];
        if (!newStore[key] || !newStore[key].expiresAt) return { success: true, output: '(integer) 0' };
        
        const updatedEntry = { ...newStore[key] };
        delete updatedEntry.ttl;
        delete updatedEntry.expiresAt;
        
        newStore[key] = updatedEntry;
        return { success: true, output: '(integer) 1', newStore };
      }

      // --- LISTS ---
      case 'LPUSH': {
        if (args.length < 2) return { success: false, output: "(error) ERR wrong number of arguments for 'lpush' command" };
        const [key, ...values] = args;
        
        if (newStore[key] && newStore[key].type !== 'list') {
             return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        }

        const currentList = newStore[key] ? [...newStore[key].value] : [];
        // LPUSH adds to the front (Left)
        values.forEach(v => currentList.unshift(v));
        
        newStore[key] = { type: 'list', value: currentList, createdAt: Date.now() };
        return { success: true, output: `(integer) ${currentList.length}`, newStore };
      }

      case 'RPUSH': {
        if (args.length < 2) return { success: false, output: "(error) ERR wrong number of arguments for 'rpush' command" };
        const [key, ...values] = args;
        
        if (newStore[key] && newStore[key].type !== 'list') {
             return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        }

        const currentList = newStore[key] ? [...newStore[key].value] : [];
        values.forEach(v => currentList.push(v));
        
        newStore[key] = { type: 'list', value: currentList, createdAt: Date.now() };
        return { success: true, output: `(integer) ${currentList.length}`, newStore };
      }

      case 'LPOP': {
         if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'lpop' command" };
         const key = args[0];
         if (!newStore[key]) return { success: true, output: '(nil)' };
         if (newStore[key].type !== 'list') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
         
         const currentList = [...newStore[key].value];
         const item = currentList.shift();
         
         if (currentList.length === 0) {
             delete newStore[key];
         } else {
             newStore[key] = { ...newStore[key], value: currentList };
         }
         
         return { success: true, output: item ? `"${item}"` : '(nil)', newStore };
      }

      case 'LRANGE': {
        if (args.length !== 3) return { success: false, output: "(error) ERR wrong number of arguments for 'lrange' command" };
        const [key, startStr, stopStr] = args;
        
        if (isNaN(parseInt(startStr)) || isNaN(parseInt(stopStr))) {
            return { success: false, output: '(error) ERR value is not an integer or out of range' };
        }

        if (!newStore[key]) return { success: true, output: '(empty array)' };
        if (newStore[key].type !== 'list') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };

        const list = newStore[key].value as string[];
        let start = parseInt(startStr);
        let stop = parseInt(stopStr);

        if (start < 0) start = list.length + start;
        if (stop < 0) stop = list.length + stop;
        if (start < 0) start = 0;
        
        const result = list.slice(start, stop + 1);
        
        if (result.length === 0) return { success: true, output: '(empty array)' };
        
        const formatted = result.map((item, idx) => `${idx + 1}) "${item}"`).join('\n');
        return { success: true, output: formatted };
      }

      // --- SETS ---
      case 'SADD': {
        if (args.length < 2) return { success: false, output: "(error) ERR wrong number of arguments for 'sadd' command" };
        const [key, ...values] = args;
        
        if (newStore[key] && newStore[key].type !== 'set') {
             return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        }

        const currentSet = newStore[key] ? new Set(newStore[key].value) : new Set();
        let addedCount = 0;
        values.forEach(v => {
            if (!currentSet.has(v)) {
                currentSet.add(v);
                addedCount++;
            }
        });

        newStore[key] = { type: 'set', value: Array.from(currentSet), createdAt: Date.now() };
        return { success: true, output: `(integer) ${addedCount}`, newStore };
      }

      case 'SMEMBERS': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'smembers' command" };
        const key = args[0];
        if (!newStore[key]) return { success: true, output: '(empty array)' };
        if (newStore[key].type !== 'set') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };

        const members = newStore[key].value as string[];
        const formatted = members.map((item, idx) => `${idx + 1}) "${item}"`).join('\n');
        return { success: true, output: formatted };
      }

      case 'SISMEMBER': {
        if (args.length !== 2) return { success: false, output: "(error) ERR wrong number of arguments for 'sismember' command" };
        const [key, member] = args;
        if (!newStore[key]) return { success: true, output: '(integer) 0' };
        if (newStore[key].type !== 'set') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        
        const members = newStore[key].value as string[];
        return { success: true, output: members.includes(member) ? '(integer) 1' : '(integer) 0' };
      }

      // --- HASHES ---
      case 'HSET': {
        if (args.length < 3) return { success: false, output: "(error) ERR wrong number of arguments for 'hset' command" };
        const [key, field, value] = args;

        if (newStore[key] && newStore[key].type !== 'hash') {
             return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };
        }

        const currentHash = newStore[key] ? { ...newStore[key].value } : {};
        const isNewField = !currentHash[field];
        currentHash[field] = value;

        newStore[key] = { type: 'hash', value: currentHash, createdAt: Date.now() };
        return { success: true, output: `(integer) ${isNewField ? 1 : 0}`, newStore };
      }

      case 'HGET': {
        if (args.length !== 2) return { success: false, output: "(error) ERR wrong number of arguments for 'hget' command" };
        const [key, field] = args;
        
        if (!newStore[key]) return { success: true, output: '(nil)' };
        if (newStore[key].type !== 'hash') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };

        const val = newStore[key].value[field];
        return { success: true, output: val ? `"${val}"` : '(nil)' };
      }

      case 'HGETALL': {
        if (args.length !== 1) return { success: false, output: "(error) ERR wrong number of arguments for 'hgetall' command" };
        const key = args[0];
        
        if (!newStore[key]) return { success: true, output: '(empty array)' };
        if (newStore[key].type !== 'hash') return { success: false, output: '(error) WRONGTYPE Operation against a key holding the wrong kind of value' };

        const entries = Object.entries(newStore[key].value);
        if (entries.length === 0) return { success: true, output: '(empty array)' };

        // Redis returns field then value in lines
        const lines = [];
        let counter = 1;
        for (const [k, v] of entries) {
            lines.push(`${counter}) "${k}"`);
            counter++;
            lines.push(`${counter}) "${v}"`);
            counter++;
        }
        return { success: true, output: lines.join('\n') };
      }

      // --- ADMIN ---
      case 'KEYS': {
        // Validation: KEYS requires a pattern
        if (args.length !== 1) {
            return { success: false, output: "(error) ERR wrong number of arguments for 'keys' command" };
        }
        // For simulation, we'll treat any pattern as "match all" for simplicity, 
        // but enforcing the argument is the key UX improvement here.
        return { 
            success: true, 
            output: Object.keys(newStore).length > 0 
                ? Object.keys(newStore).map((k, i) => `${i+1}) "${k}"`).join('\n') 
                : '(empty array)' 
        };
      }

      case 'FLUSHALL': {
        return { success: true, output: 'OK', newStore: {} };
      }

      case 'INFO': {
        return { 
          success: true, 
          output: `# Server\nredis_version:7.0.0\nredis_mode:standalone\nos:Browser\n\n# Clients\nconnected_clients:1\n\n# Memory\nused_memory_human:1.2M` 
        };
      }

      default:
        return { success: false, output: `(error) ERR unknown command '${command}'` };
    }
  } catch (e) {
    return { success: false, output: `(error) Internal processing error` };
  }
};