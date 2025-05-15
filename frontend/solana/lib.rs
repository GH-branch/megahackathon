use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ"); // Your program ID

#[program]
pub mod restaurant_bill_split {
    use super::*;

    pub fn create_bill(
        ctx: Context<CreateBill>,
        restaurant_name: String,
        bill_id: String,
        total_amount: u64,
    ) -> Result<()> {
        let bill = &mut ctx.accounts.bill;
        bill.restaurant = ctx.accounts.restaurant.key();
        bill.bill_id = bill_id;
        bill.total_amount = total_amount;
        bill.paid_amount = 0;
        bill.is_settled = false;
        bill.participants_count = 0;
        
        msg!("Created bill for restaurant: {}", restaurant_name);
        Ok(())
    }

    pub fn add_participant(
        ctx: Context<AddParticipant>,
        amount: u64
    ) -> Result<()> {
        let bill = &mut ctx.accounts.bill;
        let participant = &mut ctx.accounts.participant;
        
        bill.participants_count += 1;
        
        participant.user = ctx.accounts.user.key();
        participant.bill = bill.key();
        participant.amount = amount;
        participant.is_paid = false;
        
        msg!("Added participant to bill");
        Ok(())
    }

    pub fn settle_payment(
        ctx: Context<SettlePayment>
    ) -> Result<()> {
        let bill = &mut ctx.accounts.bill;
        let participant = &mut ctx.accounts.participant;
        
        // Transfer SOL from user to restaurant
        let transfer_amount = participant.amount;
        msg!("Transferring {} lamports from {} to {}", 
            transfer_amount,
            ctx.accounts.user.key(),
            ctx.accounts.restaurant.key()
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.restaurant.to_account_info(),
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, transfer_amount)?;
        
        participant.is_paid = true;
        bill.paid_amount = bill.paid_amount.checked_add(participant.amount)
            .ok_or(ErrorCode::AmountOverflow)?;
            
        if bill.paid_amount >= bill.total_amount {
            bill.is_settled = true;
            msg!("Bill fully settled!");
        }
        
        msg!("Payment settled successfully!");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(restaurant_name: String, bill_id: String)]
pub struct CreateBill<'info> {
    #[account(
        init,
        payer = restaurant,
        space = 8 + 32 + 4 + bill_id.len() + 8 + 8 + 1 + 1
    )]
    pub bill: Account<'info, BillAccount>,
    #[account(mut)]
    pub restaurant: Signer<'info>,
    /// CHECK: This is the system program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddParticipant<'info> {
    #[account(mut)]
    pub bill: Account<'info, BillAccount>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 1
    )]
    pub participant: Account<'info, ParticipantAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is the system program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettlePayment<'info> {
    #[account(mut)]
    pub bill: Account<'info, BillAccount>,
    #[account(
        mut,
        has_one = user,
        has_one = bill,
        constraint = !participant.is_paid @ ErrorCode::AlreadyPaid
    )]
    pub participant: Account<'info, ParticipantAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub restaurant: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BillAccount {
    pub restaurant: Pubkey,
    pub bill_id: String,
    pub total_amount: u64,
    pub paid_amount: u64,
    pub is_settled: bool,
    pub participants_count: u8,
}

#[account]
pub struct ParticipantAccount {
    pub user: Pubkey,
    pub bill: Pubkey,
    pub amount: u64,
    pub is_paid: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount would overflow")]
    AmountOverflow,
    #[msg("Bill already settled")]
    BillSettled,
    #[msg("Participant already paid")]
    AlreadyPaid,
}