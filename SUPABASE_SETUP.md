# Supabase Setup Guide

This guide explains how to set up and verify the Supabase integration for the King Myco Bot.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Access to the Supabase project dashboard
- The `.env` file configured with your credentials

## Quick Start

The bot is pre-configured to connect to the King Myco Supabase project. Follow these steps:

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

The `.env.example` file already contains the correct Supabase credentials:
- **Project URL**: `https://ddsnflsvxxmkeixykcfj.supabase.co`
- **Anon Key**: Already set in the file

### 2. Set Up the Database Schema

To initialize the database tables and functions:

1. **Log in to Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your King Myco project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Create a new query

3. **Run the Setup Script**
   - Copy the contents of `supabase-setup.sql` from this repository
   - Paste into the SQL editor
   - Click "Run" to execute the script

The script will create:
- `user_profiles` - Store user wallets and Telegram info
- `quests` - Manage bot quests and challenges
- `spore_transactions` - Track spore earnings and spending
- `participation_proofs` - Record user participation
- `daily_button_winners` - Track daily winners
- `wallet_connections` - Link wallets to users
- Performance indexes for faster queries
- Row Level Security (RLS) policies for data protection
- `get_daily_wins_leaderboard()` function for leaderboards

### 3. Verify the Database Connection

After running the setup script, verify your tables exist:

1. In the Supabase dashboard, go to "Table Editor"
2. You should see all the tables listed above
3. Check that the tables are empty (no data yet)

### 4. Test the Bot Integration

Start the bot:
```bash
npm start
```

Look for the startup message:
```
✅ Supabase integration initialized successfully
```

If you see this message, the bot is connected to Supabase!

### 5. Test Supabase Features

Test these commands in Telegram to verify the integration:

- `/start` - Should create/update your user profile
- `/spores` - Check your spore balance (stored in Supabase)
- `/leaderboard` - View the spore leaderboard
- `/daily_winners` - View daily winners (if enabled)

## Troubleshooting

### "Supabase credentials not configured" Warning

If you see this warning on startup:
1. Check that `.env` file exists in the project root
2. Verify `SUPABASE_URL` and `SUPABASE_KEY` are set correctly
3. Ensure there are no extra spaces or quotes around the values

### Connection Errors

If you get connection errors:
1. Verify your project URL is correct: `https://ddsnflsvxxmkeixykcfj.supabase.co`
2. Check that your anon key is valid (it should start with `eyJ`)
3. Ensure your Supabase project is active (not paused)

### Missing Tables

If features don't work:
1. Verify you ran the `supabase-setup.sql` script completely
2. Check the SQL editor for any errors during execution
3. Use "Table Editor" to confirm all tables exist

### RLS Policy Issues

If you can't read data:
1. The setup script creates public read-only policies
2. Verify RLS is enabled in "Authentication" > "Policies"
3. Check that the policies were created for each table

## Database Schema

For detailed information about the database schema, see `supabase-setup.sql`.

Key features:
- **User Profiles**: Links Telegram users to Solana wallets
- **Spore System**: Virtual currency for engagement
- **Quest System**: Create and complete quests for rewards
- **Leaderboards**: Track top spore earners and daily winners
- **Audit Trail**: All spore transactions are logged

## Advanced Configuration

### Custom Supabase Project

If you want to use your own Supabase project:

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the `supabase-setup.sql` script in your project
3. Update `.env` with your project's credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

### Environment Variables

The bot uses these Supabase environment variables:

- `SUPABASE_URL` (Required) - Your Supabase project URL
- `SUPABASE_KEY` (Required) - Your Supabase anonymous (public) key

**Note**: The anon key is safe to use in client-side code. Row Level Security (RLS) policies protect your data.

## Additional Documentation

For more information, see:
- `SUPABASE_VERIFICATION.md` - How to verify Supabase integration
- `SUPABASE_DAILY_WINNERS_SETUP.md` - Daily winners feature setup
- `README.md` - General bot setup and features

## Support

If you encounter issues:
1. Check the bot logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the database schema is properly initialized
4. Review the Supabase dashboard for connection status
