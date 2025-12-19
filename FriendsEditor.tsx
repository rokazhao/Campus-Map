// TODO: Implement FriendsEditor
import React, { Component } from "react";
import { USERS } from './users';

type FriendsEditorProps = {
    user: string;
    friends: string[];
    onAdd: (friend: string) => void;
    onRemove: (friend: string) => void;
};

type FriendsEditorState = {
    selected: string;
};

export class FriendsEditor extends Component<FriendsEditorProps, FriendsEditorState> {
    constructor(props: FriendsEditorProps) {
        super(props);
        this.state = { selected: "" };
    }

    doButtonClick = (u: string, isFriend: boolean): void => {
        if (isFriend) {
            this.props.onRemove(u);
        } else {
            this.props.onAdd(u);
        }
    }

    render = (): JSX.Element => {
        const userList: JSX.Element[] = [];
        for (const u of USERS) {
            if (u !== this.props.user) {
                const isFriend = this.props.friends.indexOf(u) !== -1;
                userList.push(
                    <li key={u}>
                        {u}{" "}
                        <button onClick={() => this.doButtonClick(u, isFriend)}>
                            {isFriend ? "UnFriend" : "Friend"}
                        </button>
                    </li>
                );
            }
        }

        return (
            <div>
                <h4>Check those users who are your friends:</h4>
                <ul>
                   {userList}
                </ul>
                <div>
                    Those users will see some information about your schedule.
                </div>
            </div>
        );
    }
}