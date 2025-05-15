use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct OffChainState {
    pub bill_pubkey: Pubkey,
    pub participant_allocations: Vec<ParticipantAllocation>,
    pub sequence_number: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ParticipantAllocation {
    pub user: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct InitChannel<'info> {
    #[account(mut)]
    pub bill: Account<'info, super::BillAccount>,
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 4 + 1024 + 8 // Space for state channel data
    )]
    pub channel: Account<'info, ChannelAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleChannel<'info> {
    #[account(mut)]
    pub bill: Account<'info, super::BillAccount>,
    #[account(
        mut,
        constraint = channel.bill == bill.key()
    )]
    pub channel: Account<'info, ChannelAccount>,
    #[account(mut)]
    pub closer: Signer<'info>,
}

#[account]
pub struct ChannelAccount {
    pub bill: Pubkey,
    pub participants: Vec<Pubkey>,
    pub latest_state_hash: [u8; 32],
    pub sequence_number: u64,
}
